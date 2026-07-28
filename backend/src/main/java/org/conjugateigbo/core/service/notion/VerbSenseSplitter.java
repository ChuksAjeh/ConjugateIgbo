package org.conjugateigbo.core.service.notion;

import java.text.Normalizer;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Set;

/**
 * Splits a "dual meaning" verb entry into its individual (form, sense) pairs
 * and normalises the pieces for storage.
 *
 * <p>This is the single implementation of the splitting grammar. Both the
 * Notion ingestion pipeline ({@link VerbCandidateExtractor}) and the legacy-row
 * reconciliation ({@code LegacyVerbReconciliationService}) call it, so a row
 * split during a later reconciliation is guaranteed to produce the same senses
 * the pipeline produced — otherwise the two could disagree and leave a verb
 * both combined and split.
 *
 * <p>Two independent kinds of "dual meaning" occur in the source data:
 * <ul>
 *   <li><strong>Polysemy</strong> — one form, several meanings in the English
 *       column: {@code "to depart/leave/take off"} → three senses.</li>
 *   <li><strong>Alternate forms</strong> — one meaning, several spellings in
 *       the Igbo column: {@code "ịbulu/ibu"} → two forms.</li>
 * </ul>
 *
 * <p>Splitting is on {@code /} at bracket depth zero only, so a slash inside a
 * parenthetical — {@code "to be (state of person/thing/location of an obj)"} —
 * is never split.
 *
 * <p>This class is stateless; all methods are static.
 */
public final class VerbSenseSplitter {

    /**
     * Split fragments that carry no verbal sense on their own and are therefore
     * dropped rather than turned into a standalone gloss.
     *
     * <p>Two kinds appear in the source data:
     * <ul>
     *   <li><strong>Bare prepositions</strong> — {@code "to hold/use/with"} is
     *       shorthand for "to hold, to use, to be with"; without dropping
     *       {@code with} the split would coin {@code "to with"}.</li>
     *   <li><strong>Bare modal auxiliaries</strong> — {@code "to be able to/can"}
     *       lists {@code can} as a synonym of the whole phrase, not an adjective
     *       completing "to be ___". Inheriting the {@code "to be "} marker would
     *       coin the ungrammatical {@code "to be can"}; the infinitive
     *       {@code "to be able to"} already carries the meaning, so {@code can}
     *       is dropped.</li>
     * </ul>
     */
    private static final Set<String> NON_VERBAL_FRAGMENTS =
            Set.of(
                    // Prepositions.
                    "with", "of", "for", "at", "on", "in", "to", "by", "from",
                    // Modal auxiliaries — never standalone infinitive glosses.
                    "can", "could", "would", "should", "shall", "will",
                    "may", "might", "must");

    private VerbSenseSplitter() {
        // Utility class — not instantiable.
    }

    /**
     * Splits an English gloss into its individual senses.
     *
     * <p>Fragments after the first inherit the first fragment's leading
     * infinitive marker, so the split yields real infinitives rather than bare
     * fragments:
     * <ul>
     *   <li>{@code "to depart/leave/take off"} → to depart, to leave, to take off</li>
     *   <li>{@code "to be sad/unhappy"} → to be sad, to be unhappy — the marker
     *       here is "to be", not "to", which is why this is not a plain
     *       {@code "to "} prefix</li>
     * </ul>
     *
     * <p>Fragments that are only a preposition or a bare modal auxiliary are
     * dropped (see {@link #NON_VERBAL_FRAGMENTS}) — e.g. {@code "to be able
     * to/can"} yields only {@code "to be able to"}.
     *
     * @param english the raw gloss.
     * @return one entry per sense; a single-element list when there is nothing
     *         to split.
     */
    public static List<String> splitSenses(String english) {
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
     * Splits an Igbo cell into the alternate forms it records.
     *
     * @param igbo the raw cell value.
     * @return one entry per accepted form; a single-element list when there is
     *         nothing to split.
     */
    public static List<String> splitForms(String igbo) {
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
     * True when a value splits into more than one form or sense — i.e. it is a
     * "combined" entry that reconciliation should break apart.
     *
     * @param igbo    the Igbo cell.
     * @param english the English gloss.
     * @return {@code true} if either column carries a top-level separator.
     */
    public static boolean isCombined(String igbo, String english) {
        return splitForms(igbo).size() > 1 || splitSenses(english).size() > 1;
    }

    /**
     * Normalises an Igbo form for storage.
     *
     * <p>Applies Unicode NFC so a decomposed {@code ị} (i + combining dot)
     * compares equal to a composed one — the mobile conjugation engine
     * normalises identically, and without this the same verb could be stored
     * twice under two byte sequences that look the same.
     *
     * <p>Also lower-cases. Igbo citation forms are conventionally lower case and
     * the app capitalises for display, but the hand-maintained source mixes
     * casing freely ({@code "Ipu"}/{@code "ipu"}, {@code "ịJi"}/{@code "ịji"}).
     *
     * @param form the raw form.
     * @return the normalised citation form.
     */
    public static String normaliseForm(String form) {
        return Normalizer.normalize(form.trim(), Normalizer.Form.NFC)
                .replaceAll("\\s+", " ")
                .toLowerCase(Locale.ROOT);
    }

    /**
     * Normalises an English gloss for storage: NFC, collapsed whitespace and
     * lower case, so {@code "To Finish"}, {@code "To finish"} and
     * {@code "to finish"} become one entry.
     *
     * @param gloss the raw gloss.
     * @return the normalised gloss.
     */
    public static String normaliseGloss(String gloss) {
        return Normalizer.normalize(gloss.trim(), Normalizer.Form.NFC)
                .replaceAll("\\s+", " ")
                .toLowerCase(Locale.ROOT);
    }

    /**
     * Returns the infinitive marker a sense list shares, based on its first
     * fragment.
     *
     * @param first the first fragment of a split gloss.
     * @return {@code "to be "}, {@code "to "}, or {@code ""} when the gloss is
     *         not an infinitive and nothing should be prepended.
     */
    private static String infinitiveMarker(String first) {
        final String lower = first.toLowerCase(Locale.ROOT);
        if (lower.startsWith("to be ")) return "to be ";
        if (lower.startsWith("to ")) return "to ";
        return "";
    }

    /**
     * Splits on {@code /} at bracket depth zero.
     *
     * <p>Keeps {@code "to be (state of person/thing/location of an obj)"} whole
     * while still splitting {@code "to talk/to speak"}.
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
}
