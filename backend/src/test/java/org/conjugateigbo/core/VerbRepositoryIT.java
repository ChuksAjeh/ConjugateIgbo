package org.conjugateigbo.core;

import org.conjugateigbo.core.model.enums.Dialect;
import org.conjugateigbo.core.repository.verb.VerbRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;

/**
 * Integration tests for {@link VerbRepository} against a real PostgreSQL
 * instance, with the full Flyway migration chain applied.
 *
 * <p>Requires a running Docker daemon (Testcontainers).
 */
public class VerbRepositoryIT extends PostgresTestConfig {

    @Autowired
    VerbRepository repo;

    @Autowired
    NamedParameterJdbcTemplate jdbc;

    @BeforeEach
    void resetTables() {
        jdbc.update("delete from audio_assets", new MapSqlParameterSource());
        jdbc.update("delete from verbs_delta_igbo", new MapSqlParameterSource());
    }

    @Test
    void emptyDbAtStart() {
        assertThat(repo.list(Dialect.DELTA_IGBO, 10, null)).isEmpty();
        assertThat(repo.listAll(Dialect.DELTA_IGBO)).isEmpty();
    }

    @Test
    void listOrdersRankedVerbsBeforeUnrankedOnes() {
        insertVerb("ibia", "to come", null);
        insertVerb("iri", "to eat", 1);

        assertThat(repo.listAll(Dialect.DELTA_IGBO))
                .extracting("igbo")
                .containsExactly("iri", "ibia");
    }

    @Test
    void listClampsOutOfRangeLimits() {
        insertVerb("iri", "to eat", 1);
        insertVerb("ibia", "to come", 2);

        // A non-positive limit would be rejected by PostgreSQL; it is clamped to 1.
        assertThat(repo.list(Dialect.DELTA_IGBO, 0, null)).hasSize(1);
        assertThat(repo.list(Dialect.DELTA_IGBO, -5, null)).hasSize(1);
        // An unbounded request is capped rather than pulling the whole table.
        assertThat(repo.list(Dialect.DELTA_IGBO, Integer.MAX_VALUE, null)).hasSize(2);
    }

    @Test
    void searchMatchesBothColumnsCaseInsensitively() {
        insertVerb("iri", "to eat", 1);
        insertVerb("ibia", "to come", 2);

        assertThat(repo.list(Dialect.DELTA_IGBO, 10, "EAT"))
                .extracting("igbo").containsExactly("iri");
        assertThat(repo.list(Dialect.DELTA_IGBO, 10, "BIA"))
                .extracting("igbo").containsExactly("ibia");
    }

    @Test
    void findOneReturnsEmptyForAnUnknownId() {
        assertThat(repo.findOne(Dialect.DELTA_IGBO, 999_999L)).isEmpty();
    }

    /**
     * Regression test for migration V1.2.0.
     *
     * <p>{@code audio_assets.dialect} was a PostgreSQL enum of
     * ('standard','variant','slang') while every code path bound a dialect slug
     * as a varchar. PostgreSQL has no {@code varchar = dialect} operator, so
     * this query threw rather than returning an empty result.
     */
    @Test
    void findAudioQueriesTheDialectColumnWithoutATypeError() {
        assertThatCode(() -> repo.findAudio(Dialect.DELTA_IGBO, 1L))
                .doesNotThrowAnyException();
        assertThat(repo.findAudio(Dialect.DELTA_IGBO, 1L)).isEmpty();
    }

    @Test
    void findAudioReturnsTheMostRecentRecordingForTheDialect() {
        long verbId = insertVerb("iri", "to eat", 1);
        insertAudio(Dialect.DELTA_IGBO, verbId, "audio/iri/v1.mp3");
        insertAudio(Dialect.DELTA_IGBO, verbId, "audio/iri/v2.mp3");

        assertThat(repo.findAudio(Dialect.DELTA_IGBO, verbId))
                .get()
                .extracting("objectKey")
                .isEqualTo("audio/iri/v2.mp3");
    }

    /**
     * Inserts a verb and returns its generated id.
     *
     * @param igbo     the Igbo citation form.
     * @param english  the English gloss.
     * @param freqRank frequency rank, or {@code null} for unranked.
     * @return the new row's primary key.
     */
    private long insertVerb(String igbo, String english, Integer freqRank) {
        var params = new MapSqlParameterSource()
                .addValue("igbo", igbo)
                .addValue("english", english)
                .addValue("freqRank", freqRank);
        Long id = jdbc.queryForObject(
                "insert into verbs_delta_igbo (igbo, english, freq_rank) " +
                        "values (:igbo, :english, :freqRank) returning id",
                params, Long.class);
        return id == null ? 0L : id;
    }

    /** Inserts an audio asset row for the given verb. */
    private void insertAudio(Dialect dialect, long verbId, String objectKey) {
        jdbc.update(
                "insert into audio_assets (dialect, verb_id, object_key, created_at) " +
                        "values (:dialect, :verbId, :objectKey, now())",
                new MapSqlParameterSource()
                        .addValue("dialect", dialect.slug())
                        .addValue("verbId", verbId)
                        .addValue("objectKey", objectKey));
    }
}
