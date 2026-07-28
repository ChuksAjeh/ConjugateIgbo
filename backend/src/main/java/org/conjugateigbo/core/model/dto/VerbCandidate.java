package org.conjugateigbo.core.model.dto;

/**
 * A single verb sense extracted from a Notion page, ready to be written to a
 * dialect verb table.
 *
 * <p>One Notion row can yield several candidates. {@code ipu} glossed
 * "to depart/leave/take off" produces three, one per sense, and
 * "to carry (a load)" written {@code ịbulu/ibu} produces two, one per accepted
 * form. See {@code VerbCandidateExtractor} for the splitting rules.
 *
 * @param igbo      the Igbo citation form for this sense.
 * @param english   the English gloss for this sense.
 * @param note      provenance for derived rows — the original combined entry
 *                  when the row came from a split — or {@code null} when the
 *                  row was taken verbatim.
 * @param sourceRef identifier of the Notion page the row was read from.
 */
public record VerbCandidate(String igbo, String english, String note, String sourceRef) {

    /**
     * Key used to detect duplicates, both within an import and against rows
     * already in the database.
     *
     * <p>Case- and whitespace-insensitive, matching the
     * {@code lower(igbo), lower(english)} unique index, so the in-memory
     * de-duplication and the database constraint agree on what a duplicate is.
     *
     * @return the normalised {@code igbo|english} key.
     */
    public String dedupeKey() {
        return normalise(igbo) + '|' + normalise(english);
    }

    private static String normalise(String value) {
        return value == null ? "" : value.trim().toLowerCase(java.util.Locale.ROOT).replaceAll("\\s+", " ");
    }
}
