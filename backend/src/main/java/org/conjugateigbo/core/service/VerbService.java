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

@Service
@RequiredArgsConstructor
public class VerbService {
    private static final Map<Dialect, String> TABLE = Map.of(
            Dialect.DELTA_IGBO, "verbs_delta_igbo",
            Dialect.CENTRAL_IGBO, "verbs_central_igbo"
    );
    private final VerbRepository repo;
    private final NamedParameterJdbcTemplate jdbc;
    private final ExcelVerbImportService excelImportService;

    public List<VerbDTO> list(Dialect d, int limit, String search) {
        var table = TABLE.get(d);
        var sql = (search == null || search.isBlank())
                ? "select id, igbo, english, freq_rank from " + table + " order by coalesce(freq_rank, 999999), igbo limit :limit"
                : "select id, igbo, english, freq_rank from " + table + " where igbo ilike :q or english ilike :q order by coalesce(freq_rank, 999999), igbo limit :limit";
        var params = Map.of("limit", limit, "q", "%" + search + "%");
        return jdbc.query(sql, params, (rs, i) -> new VerbDTO(
                rs.getLong("id"), rs.getString("igbo"), rs.getString("english"), rs.getObject("freq_rank", Integer.class)));
    }

    public VerbDTO one(Dialect d, long id) {
        var table = TABLE.get(d);
        return jdbc.queryForObject("select id, igbo, english, freq_rank from " + table + " where id=:id",
                Map.of("id", id),
                (rs, i) -> new VerbDTO(rs.getLong("id"), rs.getString("igbo"), rs.getString("english"), rs.getObject("freq_rank", Integer.class)));
    }


    public Optional<AudioDTO> audioMeta(Dialect d, long id) {
        return repo.findAudio(d, id);
    }

    public String signedAudioUrl(Dialect d, long id, Duration ttl) {
        // lookup object_key from audio_assets where (dialect, verb_id)=...
        // then use GCS SDK to make a V4 signed URL and return it
        return "...";
    }

    public Map<String, Object> importVerbs(Dialect d, MultipartFile file, String filePath) throws Exception {
        if (d != Dialect.DELTA_IGBO) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Import currently supported only for delta-igbo");
        }

        Path pathToUse;
        boolean isTemp = false;
        if (file != null && !file.isEmpty()) {
            Path tmp = Files.createTempFile("verbs-upload-", ".xlsx");
            try {
                Files.copy(file.getInputStream(), tmp, java.nio.file.StandardCopyOption.REPLACE_EXISTING);
            } catch (Exception e) {
                try { Files.deleteIfExists(tmp); } catch (Exception ignore) {}
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
                    "file", pathToUse.toString(),
                    "dialect", "delta-igbo",
                    "totalRows", result.totalRows(),
                    "inserted", result.inserted(),
                    "skipped", result.skipped()
            );
        } finally {
            if (isTemp) {
                try { Files.deleteIfExists(pathToUse); } catch (Exception ignore) {}
            }
        }
    }
}
