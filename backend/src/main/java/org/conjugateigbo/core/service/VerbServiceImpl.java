package org.conjugateigbo.core.service;

import lombok.RequiredArgsConstructor;
import org.conjugateigbo.core.model.dto.AudioDTO;
import org.conjugateigbo.core.model.dto.VerbDTO;
import org.conjugateigbo.core.model.enums.Dialect;
import org.conjugateigbo.core.repository.verb.VerbRepository;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Duration;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Primary implementation of {@link VerbService}.
 *
 * <p>Handles verb retrieval, single-verb lookup, Excel-based bulk import, and
 * audio URL generation. All database interactions are delegated to
 * {@link VerbRepository} (read-only queries) and
 * {@link ExcelVerbImportServiceImpl} (bulk writes).
 *
 * <p>The {@code TABLE} constant maps each {@link Dialect} to its PostgreSQL
 * table name for inline SQL queries that bypass the repository (e.g.
 * {@link #list} and {@link #listAll}).
 */
@Service
@RequiredArgsConstructor
public class VerbServiceImpl implements VerbService {

    /** Dialect-to-table-name mapping used by inline SQL queries. */
    private static final Map<Dialect, String> TABLE = Map.of(
            Dialect.DELTA_IGBO,   "verbs_delta_igbo",
            Dialect.CENTRAL_IGBO, "verbs_central_igbo"
    );

    private final VerbRepository repo;
    private final NamedParameterJdbcTemplate jdbc;
    private final ExcelVerbImportServiceImpl excelImportService;

    /**
     * {@inheritDoc}
     *
     * <p>Builds the SQL query inline so that optional search filtering can be
     * toggled without a runtime {@code if} in the middle of a query builder chain.
     */
    @Override
    public List<VerbDTO> list(Dialect d, int limit, String search) {
        var table = TABLE.get(d);
        var sql = (search == null || search.isBlank())
                ? "select id, igbo, english, freq_rank from " + table +
                  " order by coalesce(freq_rank, 999999), igbo limit :limit"
                : "select id, igbo, english, freq_rank from " + table +
                  " where igbo ilike :q or english ilike :q" +
                  " order by coalesce(freq_rank, 999999), igbo limit :limit";
        var params = Map.of("limit", limit, "q", "%" + search + "%");
        return jdbc.query(sql, params, (rs, i) -> new VerbDTO(
                rs.getLong("id"),
                rs.getString("igbo"),
                rs.getString("english"),
                rs.getObject("freq_rank", Integer.class)));
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public List<VerbDTO> listAll(Dialect d) {
        var table = TABLE.get(d);
        var sql = "select id, igbo, english, freq_rank from " + table +
                  " order by coalesce(freq_rank, 999999), igbo";
        return jdbc.query(sql, Map.of(), (rs, i) -> new VerbDTO(
                rs.getLong("id"),
                rs.getString("igbo"),
                rs.getString("english"),
                rs.getObject("freq_rank", Integer.class)));
    }

    /**
     * {@inheritDoc}
     *
     * @throws ResponseStatusException with HTTP 500 if the JDBC query returns
     *         no result (should not happen in normal operation).
     */
    @Override
    public VerbDTO one(Dialect d, long id) {
        var table = TABLE.get(d);
        return jdbc.queryForObject(
                "select id, igbo, english, freq_rank from " + table + " where id=:id",
                Map.of("id", id),
                (rs, i) -> new VerbDTO(
                        rs.getLong("id"),
                        rs.getString("igbo"),
                        rs.getString("english"),
                        rs.getObject("freq_rank", Integer.class)));
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
     * without deletion. Falls back to {@code "All Igbo Verbs.xlsx"} in the
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
                    "Import currently supported only for delta-igbo");
        }

        Path pathToUse;
        boolean isTemp = false;

        if (file != null && !file.isEmpty()) {
            Path tmp = Files.createTempFile("verbs-upload-", ".xlsx");
            try {
                Files.copy(file.getInputStream(), tmp, java.nio.file.StandardCopyOption.REPLACE_EXISTING);
            } catch (Exception e) {
                try { Files.deleteIfExists(tmp); } catch (Exception ignore) { }
                throw e;
            }
            pathToUse = tmp;
            isTemp = true;
        } else if (filePath != null && !filePath.isBlank()) {
            pathToUse = Path.of(filePath);
        } else {
            pathToUse = Path.of("All Igbo Verbs.xlsx");
        }

        try {
            var result = excelImportService.importDeltaFromExcel(pathToUse.toString());
            return Map.of(
                    "file",      pathToUse.toString(),
                    "dialect",   "delta-igbo",
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
