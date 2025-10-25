package org.conjugateigbo.core.repository.verb;

import lombok.RequiredArgsConstructor;
import org.conjugateigbo.core.model.dto.AudioDTO;
import org.conjugateigbo.core.model.dto.VerbDTO;
import org.conjugateigbo.core.model.enums.Dialect;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

import static org.conjugateigbo.core.repository.verb.Tables.VERB_TABLE;


@Repository
@RequiredArgsConstructor
public class JdbcVerbRepository implements VerbRepository {

    private final NamedParameterJdbcTemplate jdbc;

    @Override
    public List<VerbDTO> list(Dialect dialect, int limit, String search) {
        final String table = tableFor(dialect);
        var params = new MapSqlParameterSource("limit", limit);

        final String sql;
        if (search == null || search.isBlank()) {
            sql = "select id, igbo, english, freq_rank " +
                    "from " + table + " " +
                    "order by coalesce(freq_rank, 2147483647), igbo " +
                    "limit :limit";
        } else {
            sql = "select id, igbo, english, freq_rank " +
                    "from " + table + " " +
                    "where igbo ilike :q or english ilike :q " +
                    "order by coalesce(freq_rank, 2147483647), igbo " +
                    "limit :limit";
            params.addValue("q", "%" + search + "%");
        }

        return jdbc.query(sql, params, (rs, i) ->
                new VerbDTO(
                        rs.getLong("id"),
                        rs.getString("igbo"),
                        rs.getString("english"),
                        (Integer) rs.getObject("freq_rank")
                )
        );
    }

    @Override
    public Optional<VerbDTO> findOne(Dialect dialect, long id) {
        final String table = tableFor(dialect);
        final String sql = "select id, igbo, english, freq_rank " +
                "from " + table + " where id = :id";
        try {
            var dto = jdbc.queryForObject(sql, new MapSqlParameterSource("id", id), (rs, i) ->
                    new VerbDTO(
                            rs.getLong("id"),
                            rs.getString("igbo"),
                            rs.getString("english"),
                            (Integer) rs.getObject("freq_rank")
                    )
            );
            return Optional.ofNullable(dto);
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    @Override
    public Optional<AudioDTO> findAudio(Dialect dialect, long verbId) {
        final String sql =
                "select object_key, content_type, duration_ms, bytes " +
                        "from audio_assets where dialect = :dialect and verb_id = :verbId " +
                        "order by created_at desc limit 1";

        var params = new MapSqlParameterSource()
                .addValue("dialect", dialect.name().toLowerCase()) // if you used a PostgreSQL ENUM, ensure casing matches
                .addValue("verbId", verbId);

        try {
            var dto = jdbc.queryForObject(sql, params, (rs, i) ->
                    new AudioDTO(
                            rs.getString("object_key"),
                            rs.getString("content_type"),
                            (Integer) rs.getObject("duration_ms"),
                            (Long) rs.getObject("bytes")
                    )
            );
            return Optional.ofNullable(dto);
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    private String tableFor(Dialect dialect) {
        var table = VERB_TABLE.get(dialect);
        if (table == null) throw new IllegalArgumentException("Unsupported dialect: " + dialect);
        return table;
    }
}
