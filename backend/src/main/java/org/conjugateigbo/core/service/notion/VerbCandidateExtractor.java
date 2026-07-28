package org.conjugateigbo.core.service.notion;

import org.conjugateigbo.core.model.dto.VerbCandidate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.text.Normalizer;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

/**
 * Turns parsed Notion table rows into {@link VerbCandidate}s for one dialect.
 *
 * <h2>Column selection</h2>
 * <p>Only the Delta Igbo column is read. The verb page carries a Kwale column
 * alongside it, but Kwale is a distinct dialect with its own grammar and is not
 * served by the app, so its forms must never leak into the Delta table.
 *
 * <h2>Dual-meaning splitting</h2>
 * <p>Two independent kinds of "dual meaning" appear in the source data, and
 * both produce one row per sense:
 * <ul>
 *   <li><strong>Polysemy</strong> — one form, several meanings, separated in
 *       the English column: {@code ịpu} "to depart/leave/take off" becomes
 *       three rows sharing the form. This is the pattern the Notion
 *       "Polysemous Verbs" page documents.</li>
 *   <li><strong>Alternate forms</strong> — one meaning, several accepted
 *       spellings, separated in the Igbo column: "to carry (a load)"
 *       {@code ịbulu/ibu} becomes two rows sharing the gloss.</li>
 * </ul>
 * <p>When both occur in one row the product is taken, so every (form, sense)
 * pair is represented.
 *
 * <p>Splitting never happens inside brackets: "to be (state of
 * person/thing/location of an obj)" is a single sense whose parenthetical
 * happens to contain slashes.
 *
 * <p>English fragments inherit the leading {@code "to "} of the first fragment,
 * so "to say/speak" yields "to say" and "to speak" rather than a bare "speak".
 * Every split-derived row records the original combined entry in its
 * {@code note}, so a questionable split ("to hold/use/with") can be found and
 * corrected with a query rather than being indistinguishable from hand-entered
 * data.
 */
@Component
public class VerbCandidateExtractor {

    private static final Logger LOGGER = LoggerFactory.getLogger(VerbCandidateExtractor.class);

    /** Header names accepted for the English gloss column. */
    private static final Set<String> ENGLISH_HEADERS = Set.of("english", "englishmeaning", "meaning");

    /** Header names accepted for the Delta Igbo column. */
    private static final Set<String> DELTA_HEADERS =
            Set.of("verbdeltaigbo", "deltaigboverb", "deltaigbo", "delta");

    /**
     * Cell values that mean "not recorded yet". The verb page uses a bare dash
     * pair for the Kwale/Delta gaps.
     */
    private static final Set<String> PLACEHOLDER_CELLS = Set.of("-", "--", "- -", "—", "–", "n/a", "tbd", "?");

    /** Marks a topic-page row as verbal even when the gloss is not an infinitive. */
    private static final String VERB_MARKER = "(verb)";

    /**
     * Split fragments that carry no verbal sense on their own.
     *
     * <p>"to hold/use/with" is shorthand for "to hold, to use, to be with";
     * without this the split would coin "to with" as a standalone sense.
     */
    private static final Set<String> NON_VERBAL_FRAGMENTS =
            Set.of("with", "of", "for", "at", "on", "in", "to", "by", "from");

    /**
     * Longest a gloss or form may be before it is treated as prose rather than
     * a lexical entry.
     *
     * <p>Calibrated against the source page: the longest genuine gloss is
     * "to be (state of person/thing/location of an obj)" at 47 characters,
     * while the usage notes that must be excluded — "Counting and noting the
     * numbers if you don't want someone taking it without permission" — run to
     * 85. 60 sits clear of both.
     */
    private static final int MAX_ENTRY_LENGTH = 60;

    /**
     * Extracts verb candidates from one page.
     *
     * @param page the page to read.
     * @return the candidates, de-duplicated within the page and in source order.
     */
    public List<VerbCandidate> extract(NotionPage page) {
        final List<Map<String, String>> rows = NotionTableParser.parseAllRows(page.content());
        // A LinkedHashMap both de-duplicates within the page and keeps source
        // order, which makes the import log readable against the Notion page.
        final Map<String, VerbCandidate> candidates = new LinkedHashMap<>();

        for (Map<String, String> row : rows) {
            final String english = valueFor(row, ENGLISH_HEADERS);
            final String igbo = valueFor(row, DELTA_HEADERS);

            if (isBlankOrPlaceholder(english) || isBlankOrPlaceholder(igbo)) continue;
            if (!page.allRowsAreVerbs() && !looksVerbal(english)) continue;
            if (english.length() > MAX_ENTRY_LENGTH || igbo.length() > MAX_ENTRY_LENGTH) {
                // Descriptive rows such as "Counting and noting the numbers if
                // you don't want someone taking it without permission" are
                // usage notes, not glosses; a verb list is not the place for them.
                LOGGER.debug("Skipping over-long entry on {}: {}", page.title(), english);
                continue;
            }

            final List<String> senses = splitSenses(english);
            final List<String> forms = splitForms(igbo);
            final boolean derived = senses.size() > 1 || forms.size() > 1;
            final String note = derived ? "Split from Notion entry: " + igbo + " = " + english : null;

            for (String form : forms) {
                for (String sense : senses) {
                    var candidate = new VerbCandidate(
                            normaliseForm(form), normaliseGloss(sense), note, page.id());
                    if (candidate.igbo().isBlank() || candidate.english().isBlank()) continue;
                    candidates.putIfAbsent(candidate.dedupeKey(), candidate);
                }
            }
        }

        LOGGER.info("Extracted {} verb candidate(s) from {} row(s) on \"{}\"",
                candidates.size(), rows.size(), page.title());
        return List.copyOf(candidates.values());
    }

    /**
     * Splits an English gloss into its individual senses.
     *
     * <p>Fragments after the first inherit the first fragment's leading
     * infinitive marker, so the split yields real infinitives rather than bare
     * fragments:
     * <ul>
     *   <li>"to depart/leave/take off" → to depart, to leave, to take off</li>
     *   <li>"to be sad/unhappy" → to be sad, to be unhappy — the marker here is
     *       "to be", not "to", which is why this is not a plain {@code "to "}
     *       prefix</li>
     * </ul>
     *
     * <p>Fragments that are only a preposition are dropped. "to hold/use/with"
     * means "to hold, to use, to be with"; splitting it naively would coin
     * "to with", which is not a sense of anything.
     *
     * @param english the raw gloss.
     * @return one entry per sense; a single-element list when there is nothing
     *         to split.
     */
    static List<String> splitSenses(String english) {
        final List<String> parts = splitOutsideBrackets(english);
        if (parts.size() < 2) return List.of(english.trim());

        final String marker = infinitiveMarker(parts.get(0).trim());

        final List<String> senses = new ArrayList<>(parts.size());
        for (String part : parts) {
            String sense = part.trim();
            if (sense.isEmpty()) continue;
            if (NON_VERBAL_FRAGMENTS.contains(sense.toLowerCase(Locale.ROOT))) continue;
            if (!marker.isEmpty() && !sense.toLowerCase(Locale.ROOT).startsWith("to ")) {
                sense = marker + sense;
            }
            senses.add(sense);
        }
        return senses.isEmpty() ? List.of(english.trim()) : senses;
    }

    /**
     * Returns the infinitive marker a sense list shares, based on its first
     * fragment.
     *
     * @param first the first fragment of a split gloss.
     * @return {@code "to be "}, {@code "to "}, or {@code ""} when the gloss is
     *         not an infinitive at all and nothing should be prepended.
     */
    private static String infinitiveMarker(String first) {
        final String lower = first.toLowerCase(Locale.ROOT);
        if (lower.startsWith("to be ")) return "to be ";
        if (lower.startsWith("to ")) return "to ";
        return "";
    }

    /**
     * Splits an Igbo cell into the alternate forms it records.
     *
     * @param igbo the raw cell value.
     * @return one entry per accepted form.
     */
    static List<String> splitForms(String igbo) {
        final List<String> parts = splitOutsideBrackets(igbo);
        if (parts.size() < 2) return List.of(igbo.trim());

        final List<String> forms = new ArrayList<>(parts.size());
        for (String part : parts) {
            final String form = part.trim();
            if (!form.isEmpty()) forms.add(form);
        }
        return forms.isEmpty() ? List.of(igbo.trim()) : forms;
    }

    /**
     * Splits on {@code /} at bracket depth zero.
     *
     * <p>Keeps "to be (state of person/thing/location of an obj)" whole while
     * still splitting "to talk/to speak".
     *
     * @param value the text to split.
     * @return the fragments, or a single-element list when no top-level
     *         separator is present.
     */
    private static List<String> splitOutsideBrackets(String value) {
        final List<String> parts = new ArrayList<>();
        final StringBuilder current = new StringBuilder();
        int depth = 0;

        for (char c : value.toCharArray()) {
            switch (c) {
                case '(', '[' -> { depth++; current.append(c); }
                case ')', ']' -> { depth = Math.max(0, depth - 1); current.append(c); }
                case '/' -> {
                    if (depth == 0) {
                        parts.add(current.toString());
                        current.setLength(0);
                    } else {
                        current.append(c);
                    }
                }
                default -> current.append(c);
            }
        }
        parts.add(current.toString());
        return parts;
    }

    /**
     * Decides whether a topic-page row describes a verb.
     *
     * <p>Topic pages ("Time", "Food", …) are mostly nouns and set phrases, so
     * only rows glossed as an infinitive, or explicitly annotated
     * {@code (verb)}, are ingested.
     *
     * @param english the English gloss.
     * @return {@code true} if the row should be treated as a verb.
     */
    static boolean looksVerbal(String english) {
        final String lower = english.toLowerCase(Locale.ROOT);
        return lower.startsWith("to ") || lower.contains(VERB_MARKER);
    }

    /**
     * Normalises an Igbo form for storage.
     *
     * <p>Applies Unicode NFC so a decomposed {@code ị} (i + combining dot)
     * compares equal to a composed one — the mobile conjugation engine
     * normalises identically, and without this the same verb could be stored
     * twice under two byte sequences that look the same.
     *
     * <p>Also lower-cases. Igbo citation forms are conventionally lower case
     * and the app capitalises for display, but the hand-maintained page mixes
     * casing freely ("Ipu" and "ipu", "ịJi" and "ịji"). Preserving the raw
     * casing would leave the table showing whichever variant happened to be
     * ingested first.
     *
     * @param form the raw form.
     * @return the normalised citation form.
     */
    static String normaliseForm(String form) {
        return Normalizer.normalize(form.trim(), Normalizer.Form.NFC)
                .replaceAll("\\s+", " ")
                .toLowerCase(Locale.ROOT);
    }

    /**
     * Normalises an English gloss for storage: NFC, collapsed whitespace and
     * lower case, so "To Finish", "To finish" and "to finish" become one entry
     * rather than three rows differing only in capitalisation.
     *
     * @param gloss the raw gloss.
     * @return the normalised gloss.
     */
    static String normaliseGloss(String gloss) {
        return Normalizer.normalize(gloss.trim(), Normalizer.Form.NFC)
                .replaceAll("\\s+", " ")
                .toLowerCase(Locale.ROOT);
    }

    /** Reads the first present column whose normalised header is recognised. */
    private static String valueFor(Map<String, String> row, Set<String> acceptedHeaders) {
        for (Map.Entry<String, String> entry : row.entrySet()) {
            if (acceptedHeaders.contains(normaliseHeader(entry.getKey()))) {
                return entry.getValue() == null ? "" : entry.getValue().trim();
            }
        }
        return "";
    }

    /** Lower-cases a header and strips everything but letters, so
     *  "Verb(Delta Igbo)" and "delta-igbo" both match. */
    private static String normaliseHeader(String header) {
        return header == null ? "" : header.toLowerCase(Locale.ROOT).replaceAll("[^a-z]", "");
    }

    /** True for empty cells and the "not recorded" placeholders. */
    private static boolean isBlankOrPlaceholder(String value) {
        if (value == null || value.isBlank()) return true;
        return PLACEHOLDER_CELLS.contains(value.trim().toLowerCase(Locale.ROOT));
    }
}
