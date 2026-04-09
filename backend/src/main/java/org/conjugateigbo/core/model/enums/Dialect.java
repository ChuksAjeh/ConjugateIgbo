package org.conjugateigbo.core.model.enums;

/**
 * Enumeration of the Igbo dialect regions supported by the platform.
 *
 * <p>Each constant maps to a distinct PostgreSQL table containing the
 * vocabulary for that dialect (see {@code Tables.VERB_TABLE}).
 * Additional dialects can be added by:
 * <ol>
 *   <li>Adding a new constant here.</li>
 *   <li>Adding a Flyway migration that creates the corresponding verb table.</li>
 *   <li>Registering the new table in {@code Tables.VERB_TABLE}.</li>
 *   <li>Adding the slug mapping in {@code VerbController.dialectEnum()}.</li>
 * </ol>
 */
public enum Dialect {

    /** Delta State Igbo dialect — the default / most widely supported dialect. */
    DELTA_IGBO,

    /** Central Igbo — literary/standard form used in formal education. */
    CENTRAL_IGBO
}
