package org.conjugateigbo.core.service.notion;

import lombok.RequiredArgsConstructor;
import org.conjugateigbo.core.model.dto.ImportResult;
import org.conjugateigbo.core.model.enums.Dialect;
import org.conjugateigbo.core.repository.verb.Tables;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

/**
 * Default {@link LegacyVerbReconciliationService}.
 *
 * <p>Works only on rows with {@code source IS NULL} — the provenance marker for
 * data that predates any importer. Pipeline-inserted rows
 * ({@code source = 'notion-snapshot'}) and rows this service writes
 * ({@code source = 'reconcile'}) are already one-sense-per-row and are never
 * reconsidered, which also makes the operation idempotent: a second run finds
 * no combined legacy rows.
 *
 * <p>The whole reconciliation runs in one transaction, so a failure part-way
 * leaves the table exactly as it was rather than half-split.
 */
@Service
@RequiredArgsConstructor
public class LegacyVerbReconciliationServiceImpl implements LegacyVerbReconciliationService {

    private static final Logger LOGGER = LoggerFactory.getLogger(LegacyVerbReconciliationServiceImpl.class);

    /** Provenance stamped on rows written by reconciliation. */
    static final String RECONCILE_SOURCE = "reconcile";

    private final NamedParameterJdbcTemplate jdbc;

    /** A combined legacy row read from the database. */
    private record LegacyRow(long id, String igbo, String english) {
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public List<LegacyReconciliationPlan> plan(Dialect dialect) {
        final String table = tableFor(dialect);
        final List<LegacyReconciliationPlan> plans = new ArrayList<>();
        for (LegacyRow row : combinedLegacyRows(table)) {
            final List<String> senses = splitOf(row).stream()
                    .map(s -> s.igbo() + " -> " + s.english())
                    .toList();
            plans.add(new LegacyReconciliationPlan(row.id(), row.igbo(), row.english(), senses));
        }
        return plans;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    @Transactional
    public ImportResult reconcile(Dialect dialect, boolean dryRun) {
        final String table = tableFor(dialect);
        final List<LegacyRow> combined = combinedLegacyRows(table);

        int inserted = 0;
        int skipped = 0;
        for (LegacyRow row : combined) {
            for (Sense sense : splitOf(row)) {
                if (dryRun) {
                    if (exists(table, sense)) skipped++; else inserted++;
                } else if (insertSense(table, sense, row)) {
                    inserted++;
                } else {
                    skipped++;
                }
            }
            if (!dryRun) deleteRow(table, row.id());
        }

        LOGGER.info("Legacy reconciliation for {}{}: {} combined row(s) -> {} sense(s) inserted, {} already present",
                dialect.slug(), dryRun ? " (DRY RUN)" : "", combined.size(), inserted, skipped);
        return new ImportResult(combined.size(), inserted, skipped);
    }

    /**
     * Reads every combined legacy row: {@code source IS NULL} and a value that
     * the shared splitter breaks into more than one part.
     *
     * <p>The "combined" test is done in Java, not SQL, so it uses the exact
     * bracket-aware rule the pipeline uses — a naive {@code LIKE '%/%'} would
     * wrongly match a slash inside a parenthetical.
     */
    private List<LegacyRow> combinedLegacyRows(String table) {
        final List<LegacyRow> rows = jdbc.query(
                "select id, igbo, english from " + table + " where source is null",
                new MapSqlParameterSource(),
                (rs, i) -> new LegacyRow(rs.getLong("id"), rs.getString("igbo"), rs.getString("english")));
        return rows.stream()
                .filter(r -> VerbSenseSplitter.isCombined(r.igbo(), r.english()))
                .toList();
    }

    /** A normalised (form, sense) pair produced from a combined row. */
    private record Sense(String igbo, String english) {
    }

    /**
     * Splits one legacy row into its normalised senses — the product of its
     * alternate forms and its meanings, exactly as the pipeline computes it.
     */
    private List<Sense> splitOf(LegacyRow row) {
        final List<String> forms = VerbSenseSplitter.splitForms(row.igbo());
        final List<String> senses = VerbSenseSplitter.splitSenses(row.english());
        final List<Sense> out = new ArrayList<>(forms.size() * senses.size());
        for (String form : forms) {
            for (String sense : senses) {
                final String igbo = VerbSenseSplitter.normaliseForm(form);
                final String english = VerbSenseSplitter.normaliseGloss(sense);
                if (!igbo.isBlank() && !english.isBlank()) out.add(new Sense(igbo, english));
            }
        }
        return out;
    }

    /** True when a sense already exists (case-insensitively) in the table. */
    private boolean exists(String table, Sense sense) {
        final Integer count = jdbc.queryForObject(
                "select count(*) from " + table + " where lower(igbo) = :igbo and lower(english) = :english",
                new MapSqlParameterSource().addValue("igbo", sense.igbo()).addValue("english", sense.english()),
                Integer.class);
        return count != null && count > 0;
    }

    /**
     * Inserts a split sense, recording the row it came from.
     *
     * @return {@code true} if a row was written, {@code false} if the unique
     *         index rejected it as a duplicate (e.g. the pipeline already has it).
     */
    private boolean insertSense(String table, Sense sense, LegacyRow origin) {
        final int affected = jdbc.update(
                "insert into " + table + " (igbo, english, note, source, source_ref, imported_at)" +
                        " values (:igbo, :english, :note, :source, :sourceRef, now())" +
                        " on conflict do nothing",
                new MapSqlParameterSource()
                        .addValue("igbo", sense.igbo())
                        .addValue("english", sense.english())
                        .addValue("note", "Reconciled from legacy entry: " + origin.igbo() + " = " + origin.english())
                        .addValue("source", RECONCILE_SOURCE)
                        .addValue("sourceRef", "legacy:" + origin.id()));
        return affected > 0;
    }

    /** Deletes a combined legacy row once its senses are stored. */
    private void deleteRow(String table, long id) {
        jdbc.update("delete from " + table + " where id = :id",
                new MapSqlParameterSource().addValue("id", id));
    }

    /** Resolves the verb table for a dialect. */
    private static String tableFor(Dialect dialect) {
        final String table = Tables.VERB_TABLE.get(dialect);
        if (table == null) throw new IllegalArgumentException("Unsupported dialect: " + dialect);
        return table;
    }
}
