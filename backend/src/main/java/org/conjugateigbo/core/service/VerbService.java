package org.conjugateigbo.core.service;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
class VerbService {
    private static final Map<Dialect, String> TABLE = Map.of(
            Dialect.DELTA_IGBO, "verbs_delta_igbo",
            Dialect.CENTRAL_IGBO, "verbs_central_igbo"
    );
    private final NamedParameterJdbcTemplate jdbc;

    List<VerbDTO> list(Dialect d, int limit, String search) {
        var table = TABLE.get(d);
        var sql = (search == null || search.isBlank())
                ? "select id, igbo, english, freq_rank from " + table + " order by coalesce(freq_rank, 999999), igbo limit :limit"
                : "select id, igbo, english, freq_rank from " + table + " where igbo ilike :q or english ilike :q order by coalesce(freq_rank, 999999), igbo limit :limit";
        var params = Map.of("limit", limit, "q", "%" + search + "%");
        return jdbc.query(sql, params, (rs, i) -> new VerbDTO(
                rs.getLong("id"), rs.getString("igbo"), rs.getString("english"), rs.getObject("freq_rank", Integer.class)));
    }

    VerbDTO one(Dialect d, long id) {
        var table = TABLE.get(d);
        return jdbc.queryForObject("select id, igbo, english, freq_rank from " + table + " where id=:id",
                Map.of("id", id),
                (rs, i) -> new VerbDTO(rs.getLong("id"), rs.getString("igbo"), rs.getString("english"), rs.getObject("freq_rank", Integer.class)));
    }

    String signedAudioUrl(Dialect d, long id, Duration ttl) {
        // lookup object_key from audio_assets where (dialect, verb_id)=...
        // then use GCS SDK to make a V4 signed URL and return it
        return "...";
    }
}
