package org.conjugateigbo.core.service.notion;

import org.conjugateigbo.core.model.dto.ImportResult;
import org.conjugateigbo.core.model.dto.VerbCandidate;
import org.conjugateigbo.core.model.enums.Dialect;

import java.io.IOException;
import java.util.List;

/**
 * Ingests verbs recorded in Notion into a dialect's verb table.
 *
 * <p>The pipeline is designed to be run repeatedly as new verbs are written up
 * in Notion:
 * <ol>
 *   <li><strong>Ingest</strong> — read every registered page from the
 *       configured {@link NotionPageSource}.</li>
 *   <li><strong>Extract</strong> — parse the tables, keep the Delta Igbo
 *       column, and split dual-meaning entries into one row per
 *       (form, sense) pair.</li>
 *   <li><strong>De-duplicate</strong> — drop candidates already present in the
 *       table, and any repeated within the run.</li>
 *   <li><strong>Upsert</strong> — insert what remains, recording provenance.</li>
 * </ol>
 *
 * <p>Every step is idempotent, so a second run over unchanged pages inserts
 * nothing and reports every row as skipped.
 */
public interface NotionVerbImportService {

    /**
     * Runs the full pipeline for a dialect.
     *
     * @param dialect target dialect; currently only
     *                {@link Dialect#DELTA_IGBO} has Notion source data.
     * @param dryRun  when {@code true}, everything is parsed, split and
     *                de-duplicated but nothing is written. The returned counts
     *                describe what a real run would do — use this to review a
     *                batch of new verbs before committing it.
     * @return counts of candidates seen, rows inserted, and rows skipped as
     *         duplicates.
     * @throws IOException if a page source cannot be read.
     */
    ImportResult importVerbs(Dialect dialect, boolean dryRun) throws IOException;

    /**
     * Returns the candidates the pipeline would write, without touching the
     * database.
     *
     * <p>Exposed separately from {@link #importVerbs} so the splitting and
     * normalisation rules can be tested, and reviewed by a speaker, without a
     * database at all.
     *
     * @param dialect target dialect.
     * @return every extracted candidate, de-duplicated across pages.
     * @throws IOException if a page source cannot be read.
     */
    List<VerbCandidate> candidates(Dialect dialect) throws IOException;
}
