package org.conjugateigbo.core.service.notion;

/**
 * One Notion page of vocabulary, as raw Notion-flavoured Markdown.
 *
 * <p>Deliberately holds the page's unparsed text rather than pre-extracted
 * rows: the snapshot files and the live Notion API return the same format, so
 * both {@link NotionPageSource} implementations feed one parser and cannot
 * drift apart.
 *
 * @param id              Notion page id (UUID with dashes).
 * @param title           human-readable page title, used in log output.
 * @param url             canonical page URL, stored as row provenance.
 * @param content         the page body, including its {@code <table>} blocks.
 * @param allRowsAreVerbs {@code true} for the dedicated verb pages, where every
 *                        row is a verb. {@code false} for "Words By Topic"
 *                        pages, which mix nouns, phrases and verbs and so need
 *                        the extractor's verb filter.
 */
public record NotionPage(
        String id,
        String title,
        String url,
        String content,
        boolean allRowsAreVerbs
) {
}
