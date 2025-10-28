package org.conjugateigbo.core.controller;

import lombok.RequiredArgsConstructor;
import org.conjugateigbo.core.model.dto.VerbDTO;
import org.conjugateigbo.core.model.enums.Dialect;
import org.conjugateigbo.core.service.VerbServiceImpl;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.net.URI;
import java.time.Duration;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
class VerbController {
    private final VerbServiceImpl service;

    @GetMapping("/{dialect}/verbs")
    List<VerbDTO> list(@PathVariable String dialect,
                       @RequestParam(defaultValue = "100") int limit,
                       @RequestParam(required = false) String search) {
        return service.list(dialectEnum(dialect), limit, search);
    }

    // New endpoint to return ALL verbs for the given dialect (no limit)
    @GetMapping("/{dialect}/verbs/all")
    List<VerbDTO> listAll(@PathVariable String dialect) {
        return service.listAll(dialectEnum(dialect));
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

    @PostMapping(value = "/{dialect}/verbs/import", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    Map<String, Object> importVerbs(@PathVariable String dialect,
                                    @RequestParam(name = "file", required = false) MultipartFile file,
                                    @RequestParam(name = "filePath", required = false) String filePath) throws Exception {
        var d = dialectEnum(dialect);
        return service.importVerbs(d, file, filePath);
    }

    private Dialect dialectEnum(String s) {
        var key = s.toLowerCase();
        return switch (key) {
            case "delta-igbo", "delta_igbo", "deltaigbo" -> Dialect.DELTA_IGBO;
            case "central-igbo", "central_igbo", "centraligbo" -> Dialect.CENTRAL_IGBO;
            default -> throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Unknown dialect");
        };
    }


}
