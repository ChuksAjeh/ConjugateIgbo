package org.conjugateigbo.core;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Entry point for the ConjugateIgbo Spring Boot application.
 *
 * <p>Bootstraps the Spring application context, enabling component scanning,
 * auto-configuration, and Flyway-managed database migrations on startup.
 *
 * <p>Run via {@code mvn spring-boot:run} or by executing the packaged JAR:
 * <pre>{@code
 *   java -jar conjugate-igbo.jar
 * }</pre>
 */
@SpringBootApplication
public class ConjugateIgboApplication {

    /**
     * Application entry point.
     *
     * @param args command-line arguments forwarded to Spring Boot.
     */
    public static void main(String[] args) {
        SpringApplication.run(ConjugateIgboApplication.class, args);
    }
}
