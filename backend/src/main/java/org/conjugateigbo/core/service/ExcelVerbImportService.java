package org.conjugateigbo.core.service;

import java.io.IOException;

public interface ExcelVerbImportService {

    /**
     * Import verbs for Delta Igbo from the given Excel file. The file must contain columns
     * "Verb (Delta Igbo)" and "English". Other columns are ignored.
     *
     * @param filePath path to .xlsx file
     * @return result summary
     */
    ExcelVerbImportServiceImpl.ImportResult importDeltaFromExcel(String filePath) throws IOException;
}
