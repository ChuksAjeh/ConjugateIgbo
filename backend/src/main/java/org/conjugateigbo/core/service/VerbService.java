package org.conjugateigbo.core.service;

import lombok.RequiredArgsConstructor;
import org.conjugateigbo.core.model.dto.AudioDTO;
import org.conjugateigbo.core.model.dto.VerbDTO;
import org.conjugateigbo.core.model.enums.Dialect;
import org.conjugateigbo.core.repository.verb.VerbRepository;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Service;

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
}
