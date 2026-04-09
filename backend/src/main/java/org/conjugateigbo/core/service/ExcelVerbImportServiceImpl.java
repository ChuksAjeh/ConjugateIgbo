package org.conjugateigbo.core.service;

import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Reads an Excel ({@code .xlsx}) workbook and bulk-inserts Igbo verbs into the
 * {@code verbs_delta_igbo} PostgreSQL table.
 *
 * <h2>Expected file format</h2>
 * <p>The workbook's first sheet must contain a header row with at least two
 * recognisable columns:
 * <ul>
 *   <li><strong>Igbo column</strong> — header matches (case-insensitively,
 *       stripping non-alpha characters) any of:
 *       {@code verbdeltaigbo}, {@code deltaigboverb}, {@code deltaigbo},
 *       {@code igbo}, or {@code verb}.</li>
 *   <li><strong>English column</strong> — header equals {@code english}.</li>
 * </ul>
 * <p>All other columns and rows before the header row are ignored.
 *
 * <h2>Conflict handling</h2>
 * <p>Duplicate verbs (same {@code igbo} value) are skipped silently via
 * {@code ON CONFLICT (igbo) DO NOTHING}. The returned {@link ImportResult}
 * distinguishes between inserted and skipped counts.
 */
@Service
@RequiredArgsConstructor
public class ExcelVerbImportServiceImpl implements ExcelVerbImportService {

    private static final Logger log = LoggerFactory.getLogger(ExcelVerbImportServiceImpl.class);
    private final NamedParameterJdbcTemplate jdbc;

    /**
     * {@inheritDoc}
     *
     * @throws IOException if the file at {@code filePath} does not exist,
     *         the workbook has no sheets, or no recognisable header row is found.
     */
    @Override
    public ImportResult importDeltaFromExcel(String filePath) throws IOException {
        Path path = Path.of(filePath);
        if (!Files.exists(path)) {
            throw new IOException("File not found: " + path.toAbsolutePath());
        }

        try (Workbook workbook = new XSSFWorkbook(Files.newInputStream(path))) {
            Sheet sheet = workbook.getNumberOfSheets() > 0 ? workbook.getSheetAt(0) : null;
            if (sheet == null) throw new IOException("No sheets found in the workbook");

            DataFormatter formatter = new DataFormatter();

            int headerRowIdx = -1;
            int igboCol = -1;
            int englishCol = -1;

            for (Row row : sheet) {
                if (row == null) continue;
                Map<String, Integer> cols = findHeaderColumns(row, formatter);
                if (!cols.isEmpty()) {
                    headerRowIdx = row.getRowNum();
                    igboCol = cols.getOrDefault("igbo", -1);
                    englishCol = cols.getOrDefault("english", -1);
                    break;
                }
            }

            if (headerRowIdx < 0 || igboCol < 0 || englishCol < 0) {
                throw new IOException(
                        "Could not find required headers 'Verb (Delta Igbo)' and 'English'");
            }

            List<MapSqlParameterSource> batch = new ArrayList<>();
            int total = 0;

            for (int r = headerRowIdx + 1; r <= sheet.getLastRowNum(); r++) {
                Row row = sheet.getRow(r);
                if (row == null) continue;
                String igbo = formatter.formatCellValue(row.getCell(igboCol)).trim();
                String english = formatter.formatCellValue(row.getCell(englishCol)).trim();
                if (igbo.isBlank()) continue;
                total++;

                batch.add(new MapSqlParameterSource()
                        .addValue("igbo", igbo)
                        .addValue("english", english.isBlank() ? null : english));
            }

            if (batch.isEmpty()) {
                return new ImportResult(0, 0, 0);
            }

            String sql = "insert into verbs_delta_igbo (igbo, english) values (:igbo, :english) " +
                    "on conflict (igbo) do nothing";

            int[] results = jdbc.batchUpdate(sql, batch.toArray(new MapSqlParameterSource[0]));
            int inserted = 0;
            for (int c : results) {
                if (c > 0) inserted += c;
            }
            int skipped = total - inserted;

            log.info("Imported {} rows (inserted: {}, skipped: {}) from {}",
                    total, inserted, skipped, path);
            return new ImportResult(total, inserted, skipped);
        }
    }

    /**
     * Scans a header row and returns a map of recognised column roles to their
     * zero-based column indices.
     *
     * <p>Column headers are normalised by converting to lower-case and removing
     * all non-alpha characters before matching, so headers like
     * {@code "Verb (Delta Igbo)"} and {@code "delta-igbo"} are both accepted.
     *
     * @param row       the candidate header row.
     * @param formatter Apache POI {@link DataFormatter} for reading cell values.
     * @return a map with keys {@code "igbo"} and/or {@code "english"} pointing
     *         to their column indices; empty if no recognised headers were found.
     */
    private Map<String, Integer> findHeaderColumns(Row row, DataFormatter formatter) {
        Map<String, Integer> map = new HashMap<>();
        for (Cell cell : row) {
            String v = formatter.formatCellValue(cell);
            if (v == null) continue;
            String norm = v.trim().toLowerCase().replaceAll("[^a-z]", "");
            if (norm.equals("verbdeltaigbo") || norm.equals("deltaigboverb")
                    || norm.equals("deltaigbo") || norm.equals("igbo") || norm.equals("verb")) {
                map.put("igbo", cell.getColumnIndex());
            }
            if (norm.equals("english")) {
                map.put("english", cell.getColumnIndex());
            }
        }
        return map;
    }

    /**
     * Immutable summary of a single import operation.
     *
     * @param totalRows total data rows processed (excluding the header).
     * @param inserted  rows actually written to the database.
     * @param skipped   rows that conflicted with an existing {@code igbo} value
     *                  and were silently ignored.
     */
    public record ImportResult(int totalRows, int inserted, int skipped) {
    }
}
