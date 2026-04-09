package org.conjugateigbo.core.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Lightweight health-check controller.
 *
 * <p>Provides a single {@code GET /ping} endpoint that can be used by load
 * balancers, uptime monitors, and CI pipelines to verify the application is
 * running and able to handle HTTP requests.
 */
@RestController
public class PingController {

    /**
     * Health-check endpoint.
     *
     * @return HTTP 200 with the body {@code "pong"}.
     */
    @GetMapping("/ping")
    public ResponseEntity<String> ping() {
        return ResponseEntity.ok("pong");
    }
}
