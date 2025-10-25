// org/conjugateigbo/repo/Tables.java
package org.conjugateigbo.core.repository.verb;

import org.conjugateigbo.core.model.enums.Dialect;

import java.util.Map;

public final class Tables {
    public static final Map<Dialect, String> VERB_TABLE = Map.of(
            Dialect.DELTA_IGBO, "verbs_delta_igbo",
            Dialect.CENTRAL_IGBO, "verbs_central_igbo"
    );

    private Tables() {
    }
}
