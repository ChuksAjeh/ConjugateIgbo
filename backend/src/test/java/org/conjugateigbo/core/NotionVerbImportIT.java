package org.conjugateigbo.core;

import org.conjugateigbo.core.model.enums.Dialect;
import org.conjugateigbo.core.repository.verb.VerbRepository;
import org.conjugateigbo.core.service.notion.NotionVerbImportService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * End-to-end integration tests for the Notion verb pipeline against a real
 * PostgreSQL instance with the full migration chain applied.
 *
 * <p>The unit tests cover extraction and splitting; these cover the parts that
 * only a database can prove: that the {@code (lower(igbo), lower(english))}
 * unique index permits multiple senses of one form while still rejecting true
 * duplicates, and that re-running the import is a no-op.
 *
 * <p>Requires a running Docker daemon (Testcontainers).
 */
public class NotionVerbImportIT extends PostgresTestConfig {

    @Autowired
    NotionVerbImportService importService;

    @Autowired
    VerbRepository repo;

    @Autowired
    NamedParameterJdbcTemplate jdbc;

    @BeforeEach
    void emptyTheVerbTable() {
        jdbc.update("delete from audio_assets", new MapSqlParameterSource());
        jdbc.update("delete from verbs_delta_igbo", new MapSqlParameterSource());
    }

    @Test
    void aDryRunReportsWhatItWouldWriteButWritesNothing() throws Exception {
        var result = importService.importVerbs(Dialect.DELTA_IGBO, true);

        assertThat(result.totalRows()).isGreaterThan(150);
        assertThat(result.inserted()).isEqualTo(result.totalRows());
        assertThat(result.skipped()).isZero();
        assertThat(repo.listAll(Dialect.DELTA_IGBO)).isEmpty();
    }

    @Test
    void importWritesEveryCandidateOnAnEmptyTable() throws Exception {
        var result = importService.importVerbs(Dialect.DELTA_IGBO, false);

        assertThat(result.inserted()).isEqualTo(result.totalRows());
        assertThat(repo.listAll(Dialect.DELTA_IGBO)).hasSize(result.inserted());
    }

    @Test
    void reRunningTheImportInsertsNothingFurther() throws Exception {
        var first = importService.importVerbs(Dialect.DELTA_IGBO, false);
        var second = importService.importVerbs(Dialect.DELTA_IGBO, false);

        assertThat(second.totalRows()).isEqualTo(first.totalRows());
        assertThat(second.inserted()).isZero();
        assertThat(second.skipped()).isEqualTo(second.totalRows());
        assertThat(repo.listAll(Dialect.DELTA_IGBO)).hasSize(first.inserted());
    }

    @Test
    void existingRowsAreLeftAloneAndNotDuplicated() throws Exception {
        jdbc.update("insert into verbs_delta_igbo (igbo, english) values ('ịri', 'to eat')",
                new MapSqlParameterSource());

        var result = importService.importVerbs(Dialect.DELTA_IGBO, false);

        assertThat(result.skipped()).isGreaterThanOrEqualTo(1);
        assertThat(countOf("ịri", "to eat")).isEqualTo(1);
    }

    @Test
    void aVerbAlreadyPresentUnderDifferentCasingIsStillTreatedAsADuplicate() throws Exception {
        jdbc.update("insert into verbs_delta_igbo (igbo, english) values ('ỊRI', 'To Eat')",
                new MapSqlParameterSource());

        importService.importVerbs(Dialect.DELTA_IGBO, false);

        // The unique index is on lower(igbo), lower(english), and the pipeline's
        // in-memory dedupe key normalises the same way.
        assertThat(countIgnoringCase("ịri", "to eat")).isEqualTo(1);
    }

    /**
     * The point of migration V1.3.0: uniqueness on (igbo, english) rather than
     * (igbo) alone. Under the old index only the first sense of a polysemous
     * verb could ever be stored.
     */
    @Test
    void storesEverySenseOfAPolysemousVerb() throws Exception {
        importService.importVerbs(Dialect.DELTA_IGBO, false);

        var senses = jdbc.queryForList(
                "select english from verbs_delta_igbo where lower(igbo) = 'ịpu' order by english",
                new MapSqlParameterSource(), String.class);

        assertThat(senses).contains("to depart", "to leave", "to take off");
    }

    @Test
    void storesEveryAlternateFormOfOneSense() throws Exception {
        importService.importVerbs(Dialect.DELTA_IGBO, false);

        var forms = jdbc.queryForList(
                "select igbo from verbs_delta_igbo where english = 'to carry (a load)' order by igbo",
                new MapSqlParameterSource(), String.class);

        assertThat(forms).containsExactlyInAnyOrder("ibu", "ịbulu");
    }

    @Test
    void recordsProvenanceOnEveryImportedRow() throws Exception {
        importService.importVerbs(Dialect.DELTA_IGBO, false);

        var unprovenanced = jdbc.queryForObject(
                "select count(*) from verbs_delta_igbo " +
                        "where source is null or source_ref is null or imported_at is null",
                new MapSqlParameterSource(), Integer.class);

        assertThat(unprovenanced).isZero();
    }

    @Test
    void splitDerivedRowsAreIdentifiableByTheirNote() throws Exception {
        importService.importVerbs(Dialect.DELTA_IGBO, false);

        List<String> notes = jdbc.queryForList(
                "select note from verbs_delta_igbo where lower(igbo) = 'ịpu' and note is not null",
                new MapSqlParameterSource(), String.class);

        assertThat(notes).isNotEmpty()
                .allSatisfy(note -> assertThat(note).startsWith("Split from Notion entry:"));
    }

    @Test
    void importedVerbsAreServedByTheRepositoryTheAppReadsFrom() throws Exception {
        importService.importVerbs(Dialect.DELTA_IGBO, false);

        assertThat(repo.list(Dialect.DELTA_IGBO, 100, "eat"))
                .extracting("igbo")
                .isNotEmpty();
    }

    @Test
    void refusesDialectsWithNoNotionSourceData() {
        assertThatThrownBy(() -> importService.importVerbs(Dialect.CENTRAL_IGBO, true))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("delta-igbo");
    }

    private int countOf(String igbo, String english) {
        Integer count = jdbc.queryForObject(
                "select count(*) from verbs_delta_igbo where igbo = :igbo and english = :english",
                new MapSqlParameterSource().addValue("igbo", igbo).addValue("english", english),
                Integer.class);
        return count == null ? 0 : count;
    }

    private int countIgnoringCase(String igbo, String english) {
        Integer count = jdbc.queryForObject(
                "select count(*) from verbs_delta_igbo " +
                        "where lower(igbo) = lower(:igbo) and lower(english) = lower(:english)",
                new MapSqlParameterSource().addValue("igbo", igbo).addValue("english", english),
                Integer.class);
        return count == null ? 0 : count;
    }
}
