package org.conjugateigbo.core.service.notion;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Parses the {@code <table>} blocks in a Notion page into header-keyed rows.
 *
 * <p>Notion renders tables as lightweight HTML in both its Markdown export and
 * its API response, so this one parser serves the snapshot files and a live API
 * source alike.
 *
 * <p>The parser is deliberately tolerant. The verb tables are hand-maintained
 * and contain ragged rows, empty cells, stray Markdown bold markers, inline
 * {@code <span>} comment anchors and HTML comments. None of that should abort
 * an import, so unparseable structure is skipped rather than thrown on.
 *
 * <p>This class is stateless; all methods are static.
 */
public final class NotionTableParser {

    private static final Pattern TABLE = Pattern.compile("<table[^>]*>(.*?)</table>", Pattern.DOTALL);
    private static final Pattern ROW = Pattern.compile("<tr[^>]*>(.*?)</tr>", Pattern.DOTALL);
    private static final Pattern CELL = Pattern.compile("<t[dh][^>]*>(.*?)</t[dh]>", Pattern.DOTALL);
    private static final Pattern HTML_COMMENT = Pattern.compile("<!--.*?-->", Pattern.DOTALL);
    private static final Pattern INLINE_TAG = Pattern.compile("<[^>]+>");

    private NotionTableParser() {
        // Utility class — not instantiable.
    }

    /**
     * Extracts every table on the page as a list of header-keyed rows.
     *
     * <p>The first row of each table supplies the column names. Rows with fewer
     * cells than the header are padded with empty strings, so a caller can read
     * any expected column without a bounds check.
     *
     * @param content the raw page content.
     * @return one list of rows per table, in document order. Never {@code null};
     *         tables without at least a header and one data row are omitted.
     */
    public static List<List<Map<String, String>>> parseTables(String content) {
        final List<List<Map<String, String>>> tables = new ArrayList<>();
        if (content == null || content.isBlank()) return tables;

        // Strip HTML comments first so a commented-out row can never be ingested.
        final String body = HTML_COMMENT.matcher(content).replaceAll("");

        Matcher tableMatcher = TABLE.matcher(body);
        while (tableMatcher.find()) {
            List<List<String>> rows = parseRows(tableMatcher.group(1));
            if (rows.size() < 2) continue;

            final List<String> headers = rows.get(0);
            final List<Map<String, String>> keyed = new ArrayList<>(rows.size() - 1);
            for (int i = 1; i < rows.size(); i++) {
                keyed.add(toKeyedRow(headers, rows.get(i)));
            }
            tables.add(keyed);
        }
        return tables;
    }

    /**
     * Extracts every table on the page and flattens them into one row list.
     *
     * <p>Convenient for pages that split a single logical vocabulary list
     * across more than one table.
     *
     * @param content the raw page content.
     * @return all data rows from all tables.
     */
    public static List<Map<String, String>> parseAllRows(String content) {
        final List<Map<String, String>> all = new ArrayList<>();
        for (List<Map<String, String>> table : parseTables(content)) {
            all.addAll(table);
        }
        return all;
    }

    /** Splits a table body into rows of raw cell text. */
    private static List<List<String>> parseRows(String tableBody) {
        final List<List<String>> rows = new ArrayList<>();
        Matcher rowMatcher = ROW.matcher(tableBody);
        while (rowMatcher.find()) {
            final List<String> cells = new ArrayList<>();
            Matcher cellMatcher = CELL.matcher(rowMatcher.group(1));
            while (cellMatcher.find()) {
                cells.add(cleanCell(cellMatcher.group(1)));
            }
            if (!cells.isEmpty()) rows.add(cells);
        }
        return rows;
    }

    /** Pairs a data row's cells with the header names, padding short rows. */
    private static Map<String, String> toKeyedRow(List<String> headers, List<String> cells) {
        final Map<String, String> row = new LinkedHashMap<>();
        for (int i = 0; i < headers.size(); i++) {
            row.put(headers.get(i), i < cells.size() ? cells.get(i) : "");
        }
        return row;
    }

    /**
     * Reduces a cell's raw content to plain text.
     *
     * <p>Removes inline tags (Notion wraps commented-on text in {@code <span>}
     * elements), Markdown bold markers used for emphasis in the source tables,
     * and collapses whitespace. Verb forms such as {@code **ị́zụ̀**} must reach
     * the database as {@code ị́zụ̀}, not with the asterisks attached.
     *
     * @param raw the cell's inner content.
     * @return the cleaned, trimmed text; never {@code null}.
     */
    static String cleanCell(String raw) {
        if (raw == null) return "";
        String text = INLINE_TAG.matcher(raw).replaceAll("");
        text = text.replace("**", "").replace("<br>", " ");
        // Notion writes non-breaking spaces into hand-edited cells.
        text = text.replace(' ', ' ');
        return text.replaceAll("\\s+", " ").trim();
    }
}
