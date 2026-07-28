package org.conjugateigbo.core.service.notion;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

/**
 * Reads Notion page snapshots checked into {@code src/main/resources/notion}.
 *
 * <p>The manifest {@code notion/sources.json} lists each page, its metadata and
 * the file holding a verbatim copy of its content. Registering a newly written
 * Notion page is a two-file change — drop in the captured page and add a
 * manifest entry — with no code change.
 *
 * <p>Snapshots keep the import reproducible: the exact input that produced a
 * given set of rows is in version control, so an unexpected result can be
 * diffed rather than re-derived by re-fetching a page that has since changed.
 */
@Component
public class ClasspathNotionPageSource implements NotionPageSource {

    private static final Logger LOGGER = LoggerFactory.getLogger(ClasspathNotionPageSource.class);

    /** Root of the snapshot tree on the classpath. */
    static final String ROOT = "notion/";

    /** Manifest listing every registered page. */
    static final String MANIFEST = ROOT + "sources.json";

    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * A manifest entry.
     *
     * @param id              Notion page id.
     * @param title           page title.
     * @param url             canonical page URL.
     * @param file            snapshot path relative to {@link #ROOT}.
     * @param allRowsAreVerbs whether every table row on the page is a verb.
     */
    @JsonIgnoreProperties(ignoreUnknown = true)
    record SourceEntry(String id, String title, String url, String file, boolean allRowsAreVerbs) {
    }

    /**
     * {@inheritDoc}
     *
     * @throws IOException if the manifest or any referenced snapshot is missing
     *         or unreadable. A missing snapshot is a hard error rather than a
     *         skipped page, so a typo in the manifest cannot quietly shrink an
     *         import.
     */
    @Override
    public List<NotionPage> pages() throws IOException {
        final List<SourceEntry> entries = readManifest();
        final List<NotionPage> pages = new ArrayList<>(entries.size());

        for (SourceEntry entry : entries) {
            pages.add(new NotionPage(
                    entry.id(),
                    entry.title(),
                    entry.url(),
                    readSnapshot(entry.file()),
                    entry.allRowsAreVerbs()));
        }

        LOGGER.info("Loaded {} Notion page snapshot(s) from the classpath", pages.size());
        return pages;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public String sourceName() {
        return "notion-snapshot";
    }

    /** Parses {@link #MANIFEST} into its entries. */
    private List<SourceEntry> readManifest() throws IOException {
        var resource = new ClassPathResource(MANIFEST);
        if (!resource.exists()) {
            throw new IOException("Notion source manifest not found on the classpath: " + MANIFEST);
        }
        try (InputStream in = resource.getInputStream()) {
            return List.of(objectMapper.readValue(in, SourceEntry[].class));
        }
    }

    /** Reads one snapshot file as UTF-8 text. */
    private String readSnapshot(String relativePath) throws IOException {
        var resource = new ClassPathResource(ROOT + relativePath);
        if (!resource.exists()) {
            throw new IOException("Notion snapshot referenced by the manifest is missing: " + relativePath);
        }
        try (InputStream in = resource.getInputStream()) {
            return new String(in.readAllBytes(), StandardCharsets.UTF_8);
        }
    }
}
