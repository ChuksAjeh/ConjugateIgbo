package org.conjugateigbo.core.service.notion;

import org.conjugateigbo.core.model.dto.VerbCandidate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

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

            final List<String> senses = VerbSenseSplitter.splitSenses(english);
            final List<String> forms = VerbSenseSplitter.splitForms(igbo);
            final boolean derived = senses.size() > 1 || forms.size() > 1;
            final String note = derived ? "Split from Notion entry: " + igbo + " = " + english : null;

            for (String form : forms) {
                for (String sense : senses) {
                    var candidate = new VerbCandidate(
                            VerbSenseSplitter.normaliseForm(form),
                            VerbSenseSplitter.normaliseGloss(sense), note, page.id());
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
