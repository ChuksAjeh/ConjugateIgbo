package org.conjugateigbo.core.repository.verb;

import org.conjugateigbo.core.model.dto.AudioDTO;
import org.conjugateigbo.core.model.dto.VerbDTO;
import org.conjugateigbo.core.model.enums.Dialect;

import java.util.List;
import java.util.Optional;

/**
 * Repository interface for reading verb and audio data from the database.
 *
 * <p>The primary implementation is {@link JdbcVerbRepository}, which uses
 * {@code NamedParameterJdbcTemplate} to query the dialect-specific verb tables.
 *
 * <p>All methods are read-only; write operations (bulk import) go through
 * {@code ExcelVerbImportServiceImpl} directly.
 */
public interface VerbRepository {

    /**
     * Returns a paginated list of verbs for the given dialect, ordered by
     * frequency rank (ascending) and then alphabetically.
     *
     * @param dialect dialect whose table to query.
     * @param limit   maximum number of rows to return.
     * @param search  optional search string matched case-insensitively against
     *                both the {@code igbo} and {@code english} columns.
     *                Pass {@code null} or blank to disable filtering.
     * @return list of matching {@link VerbDTO}s, never {@code null}.
     */
    List<VerbDTO> list(Dialect dialect, int limit, String search);

    /**
     * Looks up a single verb by its numeric ID.
     *
     * @param dialect dialect whose table to query.
     * @param id      primary key of the verb.
     * @return an {@link Optional} containing the verb, or empty if not found.
     */
    Optional<VerbDTO> findOne(Dialect dialect, long id);

    /**
     * Retrieves the most recently created audio asset for the given verb.
     *
     * @param dialect dialect context for the audio lookup.
     * @param verbId  ID of the verb whose audio is requested.
     * @return an {@link Optional} containing audio metadata, or empty if no
     *         recording exists.
     */
    Optional<AudioDTO> findAudio(Dialect dialect, long verbId);
}
