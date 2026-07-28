package org.conjugateigbo.core.model.enums;

import java.util.Locale;
import java.util.Optional;

/**
 * Enumeration of the Igbo dialect regions supported by the platform.
 *
 * <p>Each constant maps to a distinct PostgreSQL table containing the
 * vocabulary for that dialect (see {@code Tables.VERB_TABLE}) and owns its own
 * URL slug, so the HTTP path, the {@code audio_assets.dialect} column value and
 * the enum constant can never disagree.
 *
 * <p>Additional dialects can be added by:
 * <ol>
 *   <li>Adding a new constant here with its slug.</li>
 *   <li>Adding a Flyway migration that creates the corresponding verb table
 *       and extends the {@code audio_assets_dialect_check} constraint.</li>
 *   <li>Registering the new table in {@code Tables.VERB_TABLE}.</li>
 * </ol>
 * No controller change is needed — {@link #fromSlug(String)} resolves any
 * registered dialect.
 */
public enum Dialect {

    /** Delta State Igbo dialect — the default / most widely supported dialect. */
    DELTA_IGBO("delta-igbo"),

    /** Central Igbo — literary/standard form used in formal education. */
    CENTRAL_IGBO("central-igbo");

    private final String slug;

    Dialect(String slug) {
        this.slug = slug;
    }

    /**
     * The canonical URL slug for this dialect, e.g. {@code "delta-igbo"}.
     *
     * <p>Also the value stored in {@code audio_assets.dialect}.
     *
     * @return the hyphenated slug.
     */
    public String slug() {
        return slug;
    }

    /**
     * Resolves a path-variable string to a dialect constant.
     *
     * <p>Matching is case-insensitive and tolerates hyphens, underscores, or
     * neither, so {@code delta-igbo}, {@code DELTA_IGBO} and {@code deltaigbo}
     * all resolve to {@link #DELTA_IGBO}.
     *
     * @param value the raw slug; may be {@code null}.
     * @return the matching dialect, or {@link Optional#empty()} if none matches.
     */
    public static Optional<Dialect> fromSlug(String value) {
        if (value == null || value.isBlank()) return Optional.empty();
        final String normalised = normalise(value);
        for (Dialect dialect : values()) {
            if (normalise(dialect.slug).equals(normalised)) return Optional.of(dialect);
        }
        return Optional.empty();
    }

    /** Lower-cases and strips separators so slug variants compare equal. */
    private static String normalise(String value) {
        return value.toLowerCase(Locale.ROOT).replace("-", "").replace("_", "");
    }
}
