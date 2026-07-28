package org.conjugateigbo.core.service.notion;

import lombok.RequiredArgsConstructor;
import org.conjugateigbo.core.model.dto.ImportResult;
import org.conjugateigbo.core.model.dto.VerbCandidate;
import org.conjugateigbo.core.model.enums.Dialect;
import org.conjugateigbo.core.repository.verb.Tables;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

/**
 * Default {@link NotionVerbImportService}, writing through
 * {@link NamedParameterJdbcTemplate}.
 *
 * <p>De-duplication happens twice, deliberately:
 * <ul>
 *   <li><strong>In memory</strong>, against the keys already in the table, so
 *       the log reports an honest inserted/skipped split rather than
 *       attributing every skip to a database conflict.</li>
 *   <li><strong>In the database</strong>, via {@code ON CONFLICT DO NOTHING} on
 *       the {@code (lower(igbo), lower(english))} unique index, which is what
 *       actually guarantees correctness if two imports race.</li>
 * </ul>
 * The in-memory pass is an optimisation and a reporting aid; the constraint is
 * the source of truth.
 */
@Service
@RequiredArgsConstructor
public class NotionVerbImportServiceImpl implements NotionVerbImportService {

    private static final Logger LOGGER = LoggerFactory.getLogger(NotionVerbImportServiceImpl.class);

    /** Rows per JDBC batch, to bound memory on a large first import. */
    private static final int BATCH_SIZE = 200;

    private final NotionPageSource pageSource;
    private final VerbCandidateExtractor extractor;
    private final NamedParameterJdbcTemplate jdbc;

    /**
     * {@inheritDoc}
     */
    @Override
    public List<VerbCandidate> candidates(Dialect dialect) throws IOException {
        requireSupported(dialect);

        // Keyed so a verb appearing on both the master list and a topic page is
        // collected once, with the first page's provenance.
        final Map<String, VerbCandidate> byKey = new LinkedHashMap<>();
        for (NotionPage page : pageSource.pages()) {
            for (VerbCandidate candidate : extractor.extract(page)) {
                byKey.putIfAbsent(candidate.dedupeKey(), candidate);
            }
        }
        return List.copyOf(byKey.values());
    }

    /**
     * {@inheritDoc}
     */
    @Override
    @Transactional
    public ImportResult importVerbs(Dialect dialect, boolean dryRun) throws IOException {
        requireSupported(dialect);

        final String table = Tables.VERB_TABLE.get(dialect);
        final List<VerbCandidate> candidates = candidates(dialect);
        if (candidates.isEmpty()) {
            LOGGER.warn("Notion import found no verb candidates for {}", dialect.slug());
            return ImportResult.empty();
        }

        final Set<String> existing = existingKeys(table);
        final List<VerbCandidate> toInsert = new ArrayList<>();
        for (VerbCandidate candidate : candidates) {
            if (existing.add(candidate.dedupeKey())) toInsert.add(candidate);
        }

        final int total = candidates.size();
        final int skipped = total - toInsert.size();

        if (dryRun) {
            LOGGER.info("Notion import DRY RUN for {}: {} candidate(s), {} new, {} already present",
                    dialect.slug(), total, toInsert.size(), skipped);
            return new ImportResult(total, toInsert.size(), skipped);
        }

        final int inserted = insertBatched(table, toInsert);
        LOGGER.info("Notion import for {}: {} candidate(s), {} inserted, {} skipped as duplicates",
                dialect.slug(), total, inserted, total - inserted);
        return new ImportResult(total, inserted, total - inserted);
    }

    /**
     * Reads the dedupe keys of every row already in the table.
     *
     * <p>Normalisation matches {@link VerbCandidate#dedupeKey()} and the unique
     * index, so all three agree on what counts as the same verb.
     *
     * @param table the dialect's verb table.
     * @return a mutable set of existing keys.
     */
    private Set<String> existingKeys(String table) {
        final List<String> keys = jdbc.query(
                "select lower(igbo) as i, lower(english) as e from " + table,
                new MapSqlParameterSource(),
                (rs, i) -> normalise(rs.getString("i")) + '|' + normalise(rs.getString("e")));
        return new HashSet<>(keys);
    }

    /**
     * Inserts candidates in batches, letting the unique index reject anything
     * that slipped past the in-memory check.
     *
     * @param table      the dialect's verb table.
     * @param candidates rows to write.
     * @return the number of rows actually inserted.
     */
    private int insertBatched(String table, List<VerbCandidate> candidates) {
        final String sql = "insert into " + table +
                " (igbo, english, note, source, source_ref, imported_at)" +
                " values (:igbo, :english, :note, :source, :sourceRef, now())" +
                " on conflict do nothing";

        int inserted = 0;
        for (int start = 0; start < candidates.size(); start += BATCH_SIZE) {
            final List<VerbCandidate> chunk =
                    candidates.subList(start, Math.min(start + BATCH_SIZE, candidates.size()));

            final MapSqlParameterSource[] batch = chunk.stream()
                    .map(candidate -> new MapSqlParameterSource()
                            .addValue("igbo", candidate.igbo())
                            .addValue("english", candidate.english())
                            .addValue("note", candidate.note())
                            .addValue("source", pageSource.sourceName())
                            .addValue("sourceRef", candidate.sourceRef()))
                    .toArray(MapSqlParameterSource[]::new);

            for (int affected : jdbc.batchUpdate(sql, batch)) {
                if (affected > 0) inserted += affected;
            }
        }
        return inserted;
    }

    /** Rejects dialects that have no Notion source data or no verb table. */
    private static void requireSupported(Dialect dialect) {
        if (dialect != Dialect.DELTA_IGBO) {
            throw new IllegalArgumentException(
                    "Notion import is only available for " + Dialect.DELTA_IGBO.slug()
                            + "; the Notion pages record no verified data for " + dialect.slug());
        }
    }

    private static String normalise(String value) {
        return value == null ? "" : value.trim().toLowerCase(Locale.ROOT).replaceAll("\\s+", " ");
    }
}
