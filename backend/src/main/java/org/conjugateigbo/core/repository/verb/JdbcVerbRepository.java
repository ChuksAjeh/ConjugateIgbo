package org.conjugateigbo.core.repository.verb;

import lombok.RequiredArgsConstructor;
import org.conjugateigbo.core.model.dto.AudioDTO;
import org.conjugateigbo.core.model.dto.VerbDTO;
import org.conjugateigbo.core.model.enums.Dialect;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

import static org.conjugateigbo.core.repository.verb.Tables.VERB_TABLE;

/**
 * JDBC-backed implementation of {@link VerbRepository}.
 *
 * <p>Uses {@link NamedParameterJdbcTemplate} with named parameters ({@code :name})
 * for all queries, which prevents SQL injection and improves readability over
 * positional {@code ?} placeholders.
 *
 * <p>Table names are resolved at runtime from {@link Tables#VERB_TABLE} using
 * the supplied {@link Dialect}, so the same query logic serves every dialect
 * without code duplication. The dialect is an enum constant, never user input,
 * so the interpolated table name cannot carry an injection.
 */
@Repository
@RequiredArgsConstructor
public class JdbcVerbRepository implements VerbRepository {

    /** Sentinel ordering so rows without a frequency rank sort last, not first. */
    private static final String RANK_ORDER = "coalesce(freq_rank, 2147483647), igbo";

    private static final String VERB_COLUMNS = "id, igbo, english, freq_rank";

    /** Maps a verb result row to its DTO. Shared by every verb query. */
    private static final RowMapper<VerbDTO> VERB_MAPPER = (rs, i) -> new VerbDTO(
            rs.getLong("id"),
            rs.getString("igbo"),
            rs.getString("english"),
            rs.getObject("freq_rank", Integer.class));

    private final NamedParameterJdbcTemplate jdbc;

    /**
     * {@inheritDoc}
     *
     * <p>Results are sorted by {@code coalesce(freq_rank, 2147483647)} so that
     * verbs without a frequency rank sink to the bottom rather than appearing
     * at the top.
     */
    @Override
    public List<VerbDTO> list(Dialect dialect, int limit, String search) {
        final String table = tableFor(dialect);
        var params = new MapSqlParameterSource("limit", clampLimit(limit));

        final String sql;
        if (search == null || search.isBlank()) {
            sql = "select " + VERB_COLUMNS + " from " + table +
                    " order by " + RANK_ORDER + " limit :limit";
        } else {
            sql = "select " + VERB_COLUMNS + " from " + table +
                    " where igbo ilike :q or english ilike :q" +
                    " order by " + RANK_ORDER + " limit :limit";
            params.addValue("q", "%" + search + "%");
        }

        return jdbc.query(sql, params, VERB_MAPPER);
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public List<VerbDTO> listAll(Dialect dialect) {
        final String sql = "select " + VERB_COLUMNS + " from " + tableFor(dialect) +
                " order by " + RANK_ORDER;
        return jdbc.query(sql, new MapSqlParameterSource(), VERB_MAPPER);
    }

    /**
     * {@inheritDoc}
     *
     * @return an empty {@link Optional} when the ID does not exist in the table
     *         (catches {@link EmptyResultDataAccessException} from
     *         {@code queryForObject}).
     */
    @Override
    public Optional<VerbDTO> findOne(Dialect dialect, long id) {
        final String sql = "select " + VERB_COLUMNS + " from " + tableFor(dialect) +
                " where id = :id";
        try {
            return Optional.ofNullable(
                    jdbc.queryForObject(sql, new MapSqlParameterSource("id", id), VERB_MAPPER));
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    /**
     * {@inheritDoc}
     *
     * <p>Returns the most recently uploaded audio asset
     * ({@code order by created_at desc limit 1}) so that re-recorded verbs
     * automatically supersede older recordings.
     */
    @Override
    public Optional<AudioDTO> findAudio(Dialect dialect, long verbId) {
        final String sql =
                "select object_key, content_type, duration_ms, bytes " +
                        "from audio_assets where dialect = :dialect and verb_id = :verbId " +
                        "order by created_at desc limit 1";

        var params = new MapSqlParameterSource()
                .addValue("dialect", dialect.slug())
                .addValue("verbId", verbId);

        try {
            var dto = jdbc.queryForObject(sql, params, (rs, i) ->
                    new AudioDTO(
                            rs.getString("object_key"),
                            rs.getString("content_type"),
                            rs.getObject("duration_ms", Integer.class),
                            rs.getObject("bytes", Long.class)
                    )
            );
            return Optional.ofNullable(dto);
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    /**
     * Constrains a requested page size to a sane range.
     *
     * @param limit the caller-supplied limit.
     * @return {@code limit} clamped to {@code 1..}{@link #MAX_LIMIT}.
     */
    private static int clampLimit(int limit) {
        return Math.max(1, Math.min(limit, MAX_LIMIT));
    }

    /**
     * Resolves the PostgreSQL table name for the given dialect.
     *
     * @param dialect the dialect to look up.
     * @return the table name string.
     * @throws IllegalArgumentException if {@code dialect} has no registered table.
     */
    private String tableFor(Dialect dialect) {
        var table = VERB_TABLE.get(dialect);
        if (table == null) throw new IllegalArgumentException("Unsupported dialect: " + dialect);
        return table;
    }
}
