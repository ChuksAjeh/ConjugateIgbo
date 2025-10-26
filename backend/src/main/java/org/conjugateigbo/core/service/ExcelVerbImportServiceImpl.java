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
 * Service to import verbs from an Excel file into verbs_delta_igbo table.
 */
@Service
@RequiredArgsConstructor
public class ExcelVerbImportServiceImpl implements ExcelVerbImportService {
    private static final Logger log = LoggerFactory.getLogger(ExcelVerbImportServiceImpl.class);

    private final NamedParameterJdbcTemplate jdbc;

    public ImportResult importDeltaFromExcel(String filePath) throws IOException {
        Path path = Path.of(filePath);
        if (!Files.exists(path)) {
            throw new IOException("File not found: " + path.toAbsolutePath());
        }

        try (Workbook workbook = new XSSFWorkbook(Files.newInputStream(path))) {
            Sheet sheet = workbook.getNumberOfSheets() > 0 ? workbook.getSheetAt(0) : null;
            if (sheet == null) throw new IOException("No sheets found in the workbook");

            DataFormatter formatter = new DataFormatter();

            // Find header row and column indices
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
                throw new IOException("Could not find required headers 'Verb (Delta Igbo)' and 'English'");
            }

            List<MapSqlParameterSource> batch = new ArrayList<>();
            int total = 0;

            for (int r = headerRowIdx + 1; r <= sheet.getLastRowNum(); r++) {
                Row row = sheet.getRow(r);
                if (row == null) continue;
                String igbo = formatter.formatCellValue(row.getCell(igboCol)).trim();
                String english = formatter.formatCellValue(row.getCell(englishCol)).trim();
                if (igbo.isBlank()) continue; // nothing to insert
                total++;

                var params = new MapSqlParameterSource()
                        .addValue("igbo", igbo)
                        .addValue("english", english.isBlank() ? null : english);
                batch.add(params);
            }

            if (batch.isEmpty()) {
                return new ImportResult(0, 0, 0);
            }

            String sql = "insert into verbs_delta_igbo (igbo, english) values (:igbo, :english) " +
                    "on conflict (igbo) do nothing";

            int[] results = jdbc.batchUpdate(sql, batch.toArray(new MapSqlParameterSource[0]));
            int inserted = 0;
            for (int c : results) {
                // In PostgreSQL, 1 means row inserted; 0 means conflicted/no-op
                if (c > 0) inserted += c;
            }
            int skipped = total - inserted;
            log.info("Imported {} rows (inserted: {}, skipped: {}) from {}", total, inserted, skipped, path);
            return new ImportResult(total, inserted, skipped);
        }
    }

    private Map<String, Integer> findHeaderColumns(Row row, DataFormatter formatter) {
        Map<String, Integer> map = new HashMap<>();
        for (Cell cell : row) {
            String v = formatter.formatCellValue(cell);
            if (v == null) continue;
            String norm = v.trim().toLowerCase().replaceAll("[^a-z]", "");
            // Accept common variants and be forgiving about spaces/punctuation/case
            if (norm.equals("verbdeltaigbo") || norm.equals("deltaigboverb") || norm.equals("deltaigbo") || norm.equals("igbo") || norm.equals("verb")) {
                map.put("igbo", cell.getColumnIndex());
            }
            if (norm.equals("english")) {
                map.put("english", cell.getColumnIndex());
            }
        }
        return map;
    }

    public record ImportResult(int totalRows, int inserted, int skipped) {
    }
}
