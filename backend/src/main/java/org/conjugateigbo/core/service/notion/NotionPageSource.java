package org.conjugateigbo.core.service.notion;

import java.io.IOException;
import java.util.List;

/**
 * Supplies the Notion pages the verb pipeline ingests.
 *
 * <p>Two implementations are expected:
 * <ul>
 *   <li>{@link ClasspathNotionPageSource} — reads versioned snapshots checked
 *       into {@code src/main/resources/notion}. This is the default: the import
 *       is reproducible, reviewable in a diff, and runnable in CI with no
 *       network access or credentials.</li>
 *   <li>A live API source — fetches the same pages from Notion given an
 *       integration token. Because it returns the identical
 *       {@link NotionPage#content()} format, it can be swapped in without any
 *       change to the parser, the extractor, or the import service.</li>
 * </ul>
 */
public interface NotionPageSource {

    /**
     * Returns every page registered for ingestion.
     *
     * @return the pages, in the order they should be processed.
     * @throws IOException if the underlying store cannot be read.
     */
    List<NotionPage> pages() throws IOException;

    /**
     * Short identifier for this source, recorded on imported rows.
     *
     * @return e.g. {@code "notion-snapshot"} or {@code "notion-api"}.
     */
    String sourceName();
}
