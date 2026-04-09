package org.conjugateigbo.core.service;

import org.conjugateigbo.core.model.dto.AudioDTO;
import org.conjugateigbo.core.model.dto.VerbDTO;
import org.conjugateigbo.core.model.enums.Dialect;
import org.springframework.web.multipart.MultipartFile;

import java.time.Duration;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Service interface for verb-related operations.
 *
 * <p>Provides the business logic layer between {@code VerbController} and the
 * data access layer ({@code VerbRepository}, {@code ExcelVerbImportServiceImpl}).
 * The primary implementation is {@link VerbServiceImpl}.
 */
public interface VerbService {

    /**
     * Returns a paginated, optionally filtered list of verbs for the given dialect.
     *
     * @param d      the target dialect.
     * @param limit  maximum number of verbs to return.
     * @param search optional search string; matched case-insensitively against
     *               both Igbo and English columns. Pass {@code null} to skip filtering.
     * @return list of matching verbs ordered by frequency rank then alphabetically.
     */
    List<VerbDTO> list(Dialect d, int limit, String search);

    /**
     * Returns all verbs for the given dialect without a row limit.
     *
     * @param d the target dialect.
     * @return full verb list ordered by frequency rank then alphabetically.
     */
    List<VerbDTO> listAll(Dialect d);

    /**
     * Returns a single verb by its numeric ID.
     *
     * @param d  the dialect whose table to query.
     * @param id the verb's primary key.
     * @return the matching {@link VerbDTO}.
     * @throws org.springframework.web.server.ResponseStatusException with 404
     *         if the verb does not exist (thrown by the service implementation).
     */
    VerbDTO one(Dialect d, long id);

    /**
     * Retrieves audio metadata for a verb.
     *
     * @param d  the dialect context.
     * @param id the verb's primary key.
     * @return an {@link Optional} containing audio metadata, or empty if not found.
     */
    Optional<AudioDTO> audioMeta(Dialect d, long id);

    /**
     * Generates a short-lived signed URL for streaming a verb's audio recording.
     *
     * <p><strong>Note:</strong> GCS signed URL generation is not yet implemented.
     * This method currently returns a placeholder string.
     *
     * @param d   the dialect context.
     * @param id  the verb's primary key.
     * @param ttl how long the signed URL should remain valid.
     * @return a signed URL string pointing to the audio file.
     */
    String signedAudioUrl(Dialect d, long id, Duration ttl);

    /**
     * Imports verbs from an Excel ({@code .xlsx}) file into the given dialect's table.
     *
     * <p>Either {@code file} or {@code filePath} must be provided. If both are
     * present, {@code file} (the uploaded multipart file) takes precedence.
     *
     * @param d        the target dialect (currently only {@code DELTA_IGBO} is supported).
     * @param file     the uploaded Excel file, or {@code null}.
     * @param filePath a server-side file path to the Excel file, or {@code null}.
     * @return a summary map with keys {@code totalRows}, {@code inserted}, and
     *         {@code skipped}.
     * @throws Exception if the file cannot be read or parsed.
     */
    Map<String, Object> importVerbs(Dialect d, MultipartFile file, String filePath) throws Exception;
}
