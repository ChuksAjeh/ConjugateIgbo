package org.conjugateigbo.core;

import org.conjugateigbo.core.model.enums.Dialect;
import org.conjugateigbo.core.service.notion.LegacyVerbReconciliationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * End-to-end tests for the legacy combined-gloss reconciliation against real
 * PostgreSQL.
 *
 * <p>Fixtures mirror the actual shapes found in the Railway data: alternate
 * Igbo forms ({@code ịbulu/ibu}), polysemy ({@code to depart/leave/take off}),
 * a bracketed slash that must not be split, a multi-word "to be" marker, and a
 * combined row whose split senses the pipeline already inserted.
 *
 * <p>Requires a running Docker daemon (Testcontainers) or an externally
 * provided database via {@code IT_DATASOURCE_URL}.
 */
public class LegacyVerbReconciliationIT extends PostgresTestConfig {

    @Autowired
    LegacyVerbReconciliationService reconciliation;

    @Autowired
    NamedParameterJdbcTemplate jdbc;

    @BeforeEach
    void emptyTheTable() {
        jdbc.update("delete from verbs_delta_igbo", new MapSqlParameterSource());
    }

    @Test
    void splitsAPolysemousLegacyRowAndDeletesTheCombinedOriginal() {
        insertLegacy("ịpu", "to depart/leave/take off");

        var result = reconciliation.reconcile(Dialect.DELTA_IGBO, false);

        assertThat(result.totalRows()).isEqualTo(1);
        assertThat(result.inserted()).isEqualTo(3);
        assertThat(glossesFor("ịpu"))
                .containsExactlyInAnyOrder("to depart", "to leave", "to take off");
        assertThat(exists("ịpu", "to depart/leave/take off")).isFalse();
    }

    @Test
    void splitsAlternateFormsAndDeletesTheCombinedOriginal() {
        insertLegacy("ịbulu/ibu", "to carry (a load)");

        reconciliation.reconcile(Dialect.DELTA_IGBO, false);

        assertThat(formsFor("to carry (a load)")).containsExactlyInAnyOrder("ịbulu", "ibu");
        assertThat(exists("ịbulu/ibu", "to carry (a load)")).isFalse();
    }

    @Test
    void neverSplitsASlashInsideBrackets() {
        insertLegacy("ịdi", "to be (state of person/thing/location of an obj)");

        var result = reconciliation.reconcile(Dialect.DELTA_IGBO, false);

        assertThat(result.totalRows()).isZero();
        assertThat(exists("ịdi", "to be (state of person/thing/location of an obj)")).isTrue();
        assertThat(rowCount()).isEqualTo(1);
    }

    @Test
    void honoursTheMultiWordToBeMarkerWhenSplitting() {
        insertLegacy("ịsọ́", "to be older than/younger than/to be delicious");

        reconciliation.reconcile(Dialect.DELTA_IGBO, false);

        assertThat(glossesFor("ịsọ́"))
                .containsExactlyInAnyOrder("to be older than", "to be younger than", "to be delicious");
    }

    @Test
    void doesNotDuplicateSensesThePipelineAlreadyInserted() {
        // The pipeline shape: three split senses already present...
        insertPipeline("ịpu", "to depart");
        insertPipeline("ịpu", "to leave");
        insertPipeline("ịpu", "to take off");
        // ...alongside the legacy combined row.
        insertLegacy("ịpu", "to depart/leave/take off");

        var result = reconciliation.reconcile(Dialect.DELTA_IGBO, false);

        assertThat(result.inserted()).isZero();
        assertThat(result.skipped()).isEqualTo(3);
        // The three pipeline rows remain; the combined legacy row is gone.
        assertThat(rowCount()).isEqualTo(3);
        assertThat(exists("ịpu", "to depart/leave/take off")).isFalse();
    }

    @Test
    void leavesAlreadySplitLegacyRowsAlone() {
        insertLegacy("ịri", "to eat");

        var result = reconciliation.reconcile(Dialect.DELTA_IGBO, false);

        assertThat(result.totalRows()).isZero();
        assertThat(exists("ịri", "to eat")).isTrue();
    }

    @Test
    void isIdempotent() {
        insertLegacy("ịpu", "to depart/leave/take off");

        reconciliation.reconcile(Dialect.DELTA_IGBO, false);
        var second = reconciliation.reconcile(Dialect.DELTA_IGBO, false);

        assertThat(second.totalRows()).isZero();
        assertThat(second.inserted()).isZero();
        assertThat(rowCount()).isEqualTo(3);
    }

    @Test
    void aDryRunReportsButWritesNothing() {
        insertLegacy("ịpu", "to depart/leave/take off");

        var result = reconciliation.reconcile(Dialect.DELTA_IGBO, true);

        assertThat(result.totalRows()).isEqualTo(1);
        assertThat(result.inserted()).isEqualTo(3);
        // Unchanged: the combined row is still there, nothing split.
        assertThat(rowCount()).isEqualTo(1);
        assertThat(exists("ịpu", "to depart/leave/take off")).isTrue();
    }

    @Test
    void reconciledRowsCarryProvenancePointingAtTheLegacyRow() {
        long id = insertLegacy("ịpu", "to depart/leave/take off");

        reconciliation.reconcile(Dialect.DELTA_IGBO, false);

        var sources = jdbc.queryForList(
                "select source from verbs_delta_igbo where lower(igbo) = 'ịpu'",
                new MapSqlParameterSource(), String.class);
        assertThat(sources).containsOnly("reconcile");

        var refs = jdbc.queryForList(
                "select distinct source_ref from verbs_delta_igbo where lower(igbo) = 'ịpu'",
                new MapSqlParameterSource(), String.class);
        assertThat(refs).containsOnly("legacy:" + id);
    }

    @Test
    void planPreviewsTheSplitWithoutWriting() {
        insertLegacy("ịpu", "to depart/leave/take off");
        insertLegacy("ịdi", "to be (state of person/thing/location of an obj)");

        List<LegacyVerbReconciliationService.LegacyReconciliationPlan> plan =
                reconciliation.plan(Dialect.DELTA_IGBO);

        // Only the genuinely combined row is planned; the bracketed one is not.
        assertThat(plan).singleElement().satisfies(p -> {
            assertThat(p.igbo()).isEqualTo("ịpu");
            assertThat(p.senses()).hasSize(3);
        });
        assertThat(rowCount()).isEqualTo(2);
    }

    @Test
    void worksForAnyDialectWithAVerbTable() {
        // Unlike the Notion importer (Delta-only source data), reconciliation is
        // dialect-generic: it operates on whatever table the dialect maps to.
        // The Central table exists but is empty, so this is a clean no-op.
        var result = reconciliation.reconcile(Dialect.CENTRAL_IGBO, false);
        assertThat(result.totalRows()).isZero();
        assertThat(result.inserted()).isZero();
    }

    // --- helpers --------------------------------------------------------------

    private long insertLegacy(String igbo, String english) {
        // Legacy rows predate provenance: source stays NULL.
        Long id = jdbc.queryForObject(
                "insert into verbs_delta_igbo (igbo, english) values (:igbo, :english) returning id",
                new MapSqlParameterSource().addValue("igbo", igbo).addValue("english", english),
                Long.class);
        return id == null ? 0L : id;
    }

    private void insertPipeline(String igbo, String english) {
        jdbc.update(
                "insert into verbs_delta_igbo (igbo, english, source, source_ref, imported_at)" +
                        " values (:igbo, :english, 'notion-snapshot', 'page', now())",
                new MapSqlParameterSource().addValue("igbo", igbo).addValue("english", english));
    }

    private List<String> glossesFor(String igbo) {
        return jdbc.queryForList(
                "select english from verbs_delta_igbo where lower(igbo) = lower(:igbo)",
                new MapSqlParameterSource().addValue("igbo", igbo), String.class);
    }

    private List<String> formsFor(String english) {
        return jdbc.queryForList(
                "select igbo from verbs_delta_igbo where english = :english",
                new MapSqlParameterSource().addValue("english", english), String.class);
    }

    private boolean exists(String igbo, String english) {
        Integer count = jdbc.queryForObject(
                "select count(*) from verbs_delta_igbo where lower(igbo) = lower(:igbo) and lower(english) = lower(:english)",
                new MapSqlParameterSource().addValue("igbo", igbo).addValue("english", english),
                Integer.class);
        return count != null && count > 0;
    }

    private int rowCount() {
        Integer count = jdbc.queryForObject(
                "select count(*) from verbs_delta_igbo", new MapSqlParameterSource(), Integer.class);
        return count == null ? 0 : count;
    }
}
