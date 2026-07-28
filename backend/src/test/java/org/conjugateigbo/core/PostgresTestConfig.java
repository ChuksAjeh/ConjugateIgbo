package org.conjugateigbo.core;

import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;

/**
 * Base class supplying a PostgreSQL instance to the integration tests.
 *
 * <p>By default it starts a throwaway {@code postgres:16-alpine} container via
 * Testcontainers, so a plain {@code mvn verify} needs nothing but Docker.
 *
 * <p>If the environment provides its own database — set {@code IT_DATASOURCE_URL}
 * (and optionally {@code IT_DATASOURCE_USERNAME} / {@code IT_DATASOURCE_PASSWORD},
 * both defaulting to {@code test}) — that database is used instead and no
 * container is started. This lets the suite run where Testcontainers cannot
 * reach the Docker daemon (for instance Docker Desktop's named-pipe gateway on
 * Windows, whose API the bundled docker-java client cannot negotiate) by
 * pointing at a database started through the working Docker CLI. The provided
 * database must be disposable: the migrations run against it and the tests
 * delete rows.
 */
@SpringBootTest
public abstract class PostgresTestConfig {

    /** Environment variable that, when set, supplies an external test database. */
    static final String EXTERNAL_URL_ENV = "IT_DATASOURCE_URL";

    private static final String EXTERNAL_URL = System.getenv(EXTERNAL_URL_ENV);
    private static final boolean USE_EXTERNAL = EXTERNAL_URL != null && !EXTERNAL_URL.isBlank();

    static final PostgreSQLContainer<?> pg = USE_EXTERNAL ? null :
            new PostgreSQLContainer<>("postgres:16-alpine")
                    .withDatabaseName("testdb")
                    .withUsername("test")
                    .withPassword("test");

    @DynamicPropertySource
    static void springProps(DynamicPropertyRegistry r) {
        r.add("spring.datasource.driver-class-name", () -> "org.postgresql.Driver");
        if (USE_EXTERNAL) {
            r.add("spring.datasource.url", () -> EXTERNAL_URL);
            r.add("spring.datasource.username", () -> envOrDefault("IT_DATASOURCE_USERNAME", "test"));
            r.add("spring.datasource.password", () -> envOrDefault("IT_DATASOURCE_PASSWORD", "test"));
        } else {
            if (!pg.isRunning()) pg.start();
            r.add("spring.datasource.url", pg::getJdbcUrl);
            r.add("spring.datasource.username", pg::getUsername);
            r.add("spring.datasource.password", pg::getPassword);
        }
    }

    private static String envOrDefault(String name, String fallback) {
        String value = System.getenv(name);
        return value == null || value.isBlank() ? fallback : value;
    }
}
