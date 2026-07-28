package org.conjugateigbo.core.service.notion;

import org.conjugateigbo.core.model.dto.ImportResult;
import org.conjugateigbo.core.model.enums.Dialect;

import java.util.List;

/**
 * Breaks apart legacy "combined" verb rows into one row per (form, sense).
 *
 * <p>Rows entered before the Notion pipeline existed can store several meanings
 * in a single row — {@code ịpu → "to depart/leave/take off"} — or several
 * spellings of one meaning — {@code "ịbulu/ibu" → "to carry (a load)"}. The
 * pipeline now stores those one sense per row, so once it has run a combined
 * legacy row and its split siblings coexist, which is redundant in the app.
 *
 * <p>Reconciliation splits each combined legacy row with the same
 * {@link VerbSenseSplitter} the pipeline uses, inserts any missing senses, and
 * deletes the combined original. Because the splitter is shared, a reconciled
 * sense is byte-for-byte what the pipeline would have produced, so it collides
 * with the pipeline's row on the {@code (lower(igbo), lower(english))} unique
 * index and is de-duplicated rather than doubled.
 *
 * <p>A row whose only slash sits inside a parenthetical — {@code "to be (state
 * of person/thing/location of an obj)"} — is not combined and is left untouched.
 */
public interface LegacyVerbReconciliationService {

    /**
     * Splits and removes combined legacy rows for a dialect.
     *
     * @param dialect the target dialect.
     * @param dryRun  when {@code true}, reports what it would change without
     *                writing. The counts describe a real run.
     * @return counts where {@code totalRows} is the number of combined legacy
     *         rows found, {@code inserted} the number of split senses newly
     *         written, and {@code skipped} the number of split senses that
     *         already existed (typically from the pipeline).
     */
    ImportResult reconcile(Dialect dialect, boolean dryRun);

    /**
     * Returns the combined legacy rows that {@link #reconcile} would act on,
     * without changing anything.
     *
     * <p>Exposed for review — a speaker can eyeball the split each row would
     * produce before it is applied.
     *
     * @param dialect the target dialect.
     * @return the reconciliation plan, one entry per combined legacy row.
     */
    List<LegacyReconciliationPlan> plan(Dialect dialect);

    /**
     * The split a single combined legacy row would be turned into.
     *
     * @param id       primary key of the combined legacy row.
     * @param igbo     its original Igbo cell.
     * @param english  its original English gloss.
     * @param senses   the {@code igbo → english} pairs it would become.
     */
    record LegacyReconciliationPlan(long id, String igbo, String english, List<String> senses) {
    }
}
