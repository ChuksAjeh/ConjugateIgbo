package org.conjugateigbo.core.service;

import java.io.IOException;

/**
 * Service interface for importing Igbo verbs from Excel files.
 *
 * <p>The primary implementation is {@link ExcelVerbImportServiceImpl}, which
 * reads {@code .xlsx} files containing columns for the Igbo verb form and its
 * English translation, then bulk-inserts the rows into the appropriate
 * PostgreSQL verb table.
 */
public interface ExcelVerbImportService {

    /**
     * Parses an Excel ({@code .xlsx}) file and imports verbs for the Delta Igbo
     * dialect into the {@code verbs_delta_igbo} table.
     *
     * <p>The file must contain at least two columns whose headers match
     * (case-insensitively, ignoring punctuation) one of the following patterns:
     * <ul>
     *   <li>{@code "Verb (Delta Igbo)"}, {@code "delta igbo"}, {@code "igbo"}, or
     *       {@code "verb"} — for the Igbo form column.</li>
     *   <li>{@code "English"} — for the translation column.</li>
     * </ul>
     *
     * <p>Duplicate verbs (same {@code igbo} value) are silently skipped via
     * {@code ON CONFLICT (igbo) DO NOTHING}.
     *
     * @param filePath absolute or relative path to the {@code .xlsx} file.
     * @return an {@link ExcelVerbImportServiceImpl.ImportResult} summarising
     *         how many rows were processed, inserted, and skipped.
     * @throws IOException if the file does not exist, cannot be read, or the
     *         workbook has no sheets / no recognisable header row.
     */
    ExcelVerbImportServiceImpl.ImportResult importDeltaFromExcel(String filePath) throws IOException;
}
