package org.conjugateigbo.core.model.dto;

/**
 * Immutable summary of a single verb-import run, whatever the source.
 *
 * <p>Shared by the Excel importer and the Notion ingestion pipeline so both
 * report progress in the same shape, and so the service interfaces do not have
 * to reference a nested type on a concrete implementation.
 *
 * @param totalRows total candidate rows processed (excluding headers and rows
 *                  discarded as blank).
 * @param inserted  rows actually written to the database.
 * @param skipped   rows that duplicated an existing verb and were ignored.
 */
public record ImportResult(int totalRows, int inserted, int skipped) {

    /** An import that processed nothing. */
    public static ImportResult empty() {
        return new ImportResult(0, 0, 0);
    }
}
