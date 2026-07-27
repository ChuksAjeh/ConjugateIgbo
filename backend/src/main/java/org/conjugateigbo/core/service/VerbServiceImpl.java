package org.conjugateigbo.core.service;

import lombok.RequiredArgsConstructor;
import org.conjugateigbo.core.model.dto.AudioDTO;
import org.conjugateigbo.core.model.dto.VerbDTO;
import org.conjugateigbo.core.model.enums.Dialect;
import org.conjugateigbo.core.repository.verb.VerbRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.time.Duration;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Primary implementation of {@link VerbService}.
 *
 * <p>Handles verb retrieval, single-verb lookup, Excel-based bulk import, and
 * audio URL generation.
 *
 * <p>All reads go through {@link VerbRepository}. An earlier revision kept its
 * own {@code Dialect -> table} map and issued inline SQL that duplicated the
 * repository's queries, which meant the two could (and did) diverge — the
 * service used a different {@code freq_rank} sentinel from the repository, so
 * identical requests could order unranked verbs differently depending on which
 * path served them. The service now owns no SQL at all.
 */
@Service
@RequiredArgsConstructor
public class VerbServiceImpl implements VerbService {

    /**
     * Filename used when {@code importVerbs} is called with neither an upload
     * nor an explicit path — the historical location of the verb workbook in
     * the server's working directory.
     */
    static final String DEFAULT_IMPORT_FILENAME = "All Igbo Verbs.xlsx";

    private final VerbRepository repo;
    private final ExcelVerbImportService excelImportService;

    /**
     * {@inheritDoc}
     */
    @Override
    public List<VerbDTO> list(Dialect d, int limit, String search) {
        return repo.list(d, limit, search);
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public List<VerbDTO> listAll(Dialect d) {
        return repo.listAll(d);
    }

    /**
     * {@inheritDoc}
     *
     * @throws ResponseStatusException with HTTP 404 when no verb has that ID in
     *         the dialect's table. Previously an unknown ID escaped as an
     *         {@code EmptyResultDataAccessException} and surfaced to clients as
     *         a 500.
     */
    @Override
    public VerbDTO one(Dialect d, long id) {
        return repo.findOne(d, id).orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND, "No verb with id " + id + " in " + d.slug()));
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public Optional<AudioDTO> audioMeta(Dialect d, long id) {
        return repo.findAudio(d, id);
    }

    /**
     * {@inheritDoc}
     *
     * <p><strong>TODO:</strong> Implement GCS V4 signed URL generation.
     * Look up the {@code object_key} from {@code audio_assets} for
     * {@code (dialect, verb_id)}, then use the GCS SDK to produce a
     * time-limited signed URL and return it.
     */
    @Override
    public String signedAudioUrl(Dialect d, long id, Duration ttl) {
        // Placeholder — GCS signed URL generation is not yet implemented.
        return "...";
    }

    /**
     * {@inheritDoc}
     *
     * <p>If a multipart {@code file} is provided it is written to a temporary
     * file and deleted after import completes (or on error). If only a
     * {@code filePath} is provided the file at that path is used directly
     * without deletion. Falls back to {@link #DEFAULT_IMPORT_FILENAME} in the
     * working directory when neither argument is present.
     *
     * @throws ResponseStatusException with HTTP 400 if the dialect is not
     *         {@code DELTA_IGBO} (import is only supported for that dialect).
     */
    @Override
    public Map<String, Object> importVerbs(Dialect d, MultipartFile file, String filePath) throws Exception {
        if (d != Dialect.DELTA_IGBO) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Import currently supported only for " + Dialect.DELTA_IGBO.slug());
        }

        Path pathToUse;
        boolean isTemp = false;

        if (file != null && !file.isEmpty()) {
            Path tmp = Files.createTempFile("verbs-upload-", ".xlsx");
            try {
                Files.copy(file.getInputStream(), tmp, StandardCopyOption.REPLACE_EXISTING);
            } catch (Exception e) {
                try { Files.deleteIfExists(tmp); } catch (Exception ignore) { }
                throw e;
            }
            pathToUse = tmp;
            isTemp = true;
        } else if (filePath != null && !filePath.isBlank()) {
            pathToUse = Path.of(filePath);
        } else {
            pathToUse = Path.of(DEFAULT_IMPORT_FILENAME);
        }

        try {
            var result = excelImportService.importDeltaFromExcel(pathToUse.toString());
            return Map.of(
                    "file",      pathToUse.toString(),
                    "dialect",   d.slug(),
                    "totalRows", result.totalRows(),
                    "inserted",  result.inserted(),
                    "skipped",   result.skipped()
            );
        } finally {
            if (isTemp) {
                try { Files.deleteIfExists(pathToUse); } catch (Exception ignore) { }
            }
        }
    }
}
