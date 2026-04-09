package org.conjugateigbo.core.configuration;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

/**
 * Logs the active Spring profiles at application startup.
 *
 * <p>Useful for quickly confirming which profile ({@code dev}, {@code prod},
 * etc.) is active when reviewing startup logs, especially in containerised
 * environments where profile selection is driven by environment variables.
 *
 * <p>The active profiles are determined by the {@code SPRING_PROFILES_ACTIVE}
 * environment variable or the {@code spring.profiles.active} property in
 * {@code application.yml}.
 */
@Component
public class ProfileApplicationRunner implements ApplicationRunner {

    private static final Logger LOGGER = LoggerFactory.getLogger(ProfileApplicationRunner.class);

    private final Environment environment;

    /**
     * @param environment Spring {@link Environment} used to read active profiles.
     */
    public ProfileApplicationRunner(Environment environment) {
        this.environment = environment;
    }

    /**
     * Logs all active profiles as a comma-separated list at INFO level.
     *
     * @param args command-line arguments (not used).
     */
    @Override
    public void run(ApplicationArguments args) {
        String activeProfiles = String.join(", ", environment.getActiveProfiles());
        LOGGER.info("Active Profiles: {}", activeProfiles);
    }
}
