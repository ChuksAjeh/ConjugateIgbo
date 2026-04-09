// org/conjugateigbo/repo/Tables.java
package org.conjugateigbo.core.repository.verb;

import org.conjugateigbo.core.model.enums.Dialect;

import java.util.Map;

/**
 * Central registry mapping each {@link Dialect} to its PostgreSQL table name.
 *
 * <p>Keeping the mapping here avoids scattering table-name strings across
 * multiple classes and makes it easy to add a new dialect in one place:
 * <ol>
 *   <li>Add the {@link Dialect} constant.</li>
 *   <li>Create the Flyway migration for the new table.</li>
 *   <li>Register the mapping in {@link #VERB_TABLE} below.</li>
 * </ol>
 *
 * <p>This class is intentionally non-instantiable (utility/constants class).
 */
public final class Tables {

    /**
     * Immutable mapping from {@link Dialect} to the corresponding verb table name.
     * Used by {@link JdbcVerbRepository} to build type-safe SQL queries.
     */
    public static final Map<Dialect, String> VERB_TABLE = Map.of(
            Dialect.DELTA_IGBO,   "verbs_delta_igbo",
            Dialect.CENTRAL_IGBO, "verbs_central_igbo"
    );

    private Tables() {
        // Utility class — not instantiable.
    }
}
