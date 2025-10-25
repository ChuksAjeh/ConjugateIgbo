// src/test/java/org/conjugateigbo/it/VerbRepositoryIT.java
package org.conjugateigbo.core;

import org.conjugateigbo.core.model.enums.Dialect;
import org.conjugateigbo.core.repository.verb.VerbRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
//@Sql("/data/seed_delta_igbo.sql")
public class VerbRepositoryIT extends PostgresTestConfig {

    @Autowired
    VerbRepository repo;

    @Test
    void emptyDbAtStart() {
        var list = repo.list(Dialect.DELTA_IGBO, 10, null);
        assertThat(list).isEmpty();
    }
}
