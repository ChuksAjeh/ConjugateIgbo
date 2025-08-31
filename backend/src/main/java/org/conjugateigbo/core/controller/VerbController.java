package org.conjugateigbo.core.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
class VerbController {
    private final VerbService service;

    @GetMapping("/{dialect}/verbs")
    List<VerbDTO> list(@PathVariable String dialect,
                       @RequestParam(defaultValue = "100") int limit,
                       @RequestParam(required = false) String search) {
        return service.list(dialectEnum(dialect), limit, search);
    }

    @GetMapping("/{dialect}/verbs/{id}")
    VerbDTO one(@PathVariable String dialect, @PathVariable long id) {
        return service.one(dialectEnum(dialect), id);
    }

    @GetMapping("/{dialect}/verbs/{id}/audio")
    ResponseEntity<Void> audio(@PathVariable String dialect, @PathVariable long id) {
        var url = service.signedAudioUrl(dialectEnum(dialect), id, Duration.ofMinutes(10));
        return ResponseEntity.status(302).location(URI.create(url)).build();
    }

    private Dialect dialectEnum(String s) {
        return switch (s.toLowerCase()) {
            case "delta-igbo" -> Dialect.DELTA_IGBO;
            case "central-igbo" -> Dialect.CENTRAL_IGBO;
            default -> throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Unknown dialect");
        };
    }
}
