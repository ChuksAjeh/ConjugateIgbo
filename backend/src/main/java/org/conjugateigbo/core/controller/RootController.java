package org.conjugateigbo.core.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Root landing endpoint.
 *
 * <p>Serves {@code GET /} so that hitting the deployment's base URL returns a
 * response rather than a 404. Health checks should use {@code /ping}
 * ({@link PingController}) instead — this endpoint exists for humans opening
 * the URL in a browser.
 */
@RequestMapping("/")
@RestController
public class RootController {

    private static final Logger LOGGER = LoggerFactory.getLogger(RootController.class);

    /**
     * Greeting endpoint.
     *
     * @return the literal string {@code "Hello World!"}.
     */
    @GetMapping()
    public String sayHello() {
        LOGGER.info("Hello world greeting endpoint hit");
        String response = "Hello World!";
        LOGGER.info("Successful response: {}", response);
        return response;
    }
}