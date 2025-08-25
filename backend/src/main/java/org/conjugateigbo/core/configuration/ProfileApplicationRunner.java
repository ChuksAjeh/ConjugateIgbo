package org.conjugateigbo.core.configuration;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

@Component
public class ProfileApplicationRunner implements ApplicationRunner {

    private static final Logger LOGGER = LoggerFactory.getLogger(ProfileApplicationRunner.class);

    private final Environment environment;

    public ProfileApplicationRunner(Environment environment) {
        this.environment = environment;
    }

    @Override
    public void run(ApplicationArguments args) {
        String activeProfiles = String.join(", ", environment.getActiveProfiles());
        LOGGER.info("Active Profiles: {}", activeProfiles);
    }
}