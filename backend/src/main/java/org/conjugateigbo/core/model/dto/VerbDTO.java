package org.conjugateigbo.core.model.dto;

/**
 * Data Transfer Object representing an Igbo verb as returned by the REST API.
 *
 * <p>This record is the public contract between the backend and its consumers
 * (e.g. the mobile app). Fields align with the database columns in the dialect
 * verb tables ({@code verbs_delta_igbo}, {@code verbs_central_igbo}, …).
 *
 * @param id       Unique numeric identifier (mapped to {@code BIGSERIAL} in PostgreSQL).
 * @param igbo     The Igbo infinitive form of the verb (e.g. {@code "iri"}).
 * @param english  English gloss / translation (e.g. {@code "to eat"}).
 * @param freqRank Frequency rank — lower numbers indicate more common verbs.
 *                 {@code null} when no frequency data is available.
 */
public record VerbDTO(
        long id,
        String igbo,
        String english,
        Integer freqRank
) {
}
