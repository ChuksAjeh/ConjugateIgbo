package org.conjugateigbo.core.controller;

import lombok.RequiredArgsConstructor;
import org.conjugateigbo.core.model.dto.VerbDTO;
import org.conjugateigbo.core.model.enums.Dialect;
import org.conjugateigbo.core.service.VerbService;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.net.URI;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Duration;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
class VerbController {
    private final VerbService service;
    private final org.conjugateigbo.core.service.ExcelVerbImportService excelImportService;

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

    @PostMapping(value = "/{dialect}/verbs/import", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    Map<String, Object> importVerbs(@PathVariable String dialect,
                                    @RequestParam(name = "file", required = false) MultipartFile file,
                                    @RequestParam(name = "filePath", required = false) String filePath) throws Exception {
        var d = dialectEnum(dialect);
        if (d != Dialect.DELTA_IGBO) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Import currently supported only for delta-igbo");
        }

        Path pathToUse;
        boolean isTemp = false;
        if (file != null && !file.isEmpty()) {
            // Save uploaded multipart file to a temp location
            Path tmp = Files.createTempFile("verbs-upload-", ".xlsx");
            try {
                Files.copy(file.getInputStream(), tmp, java.nio.file.StandardCopyOption.REPLACE_EXISTING);
            } catch (Exception e) {
                try {
                    Files.deleteIfExists(tmp);
                } catch (Exception ignore) {
                }
                throw e;
            }
            pathToUse = tmp;
            isTemp = true;
        } else if (filePath != null && !filePath.isBlank()) {
            pathToUse = Path.of(filePath);
        } else {
            pathToUse = Path.of("All Igbo Verbs.xlsx");
        }

        try {
            var result = excelImportService.importDeltaFromExcel(pathToUse.toString());
            return Map.of(
                    "file", pathToUse.toString(),
                    "dialect", "delta-igbo",
                    "totalRows", result.totalRows(),
                    "inserted", result.inserted(),
                    "skipped", result.skipped()
            );
        } finally {
            if (isTemp) {
                try {
                    Files.deleteIfExists(pathToUse);
                } catch (Exception ignore) {
                }
            }
        }
    }

    private Dialect dialectEnum(String s) {
        return switch (s.toLowerCase()) {
            case "delta-igbo" -> Dialect.DELTA_IGBO;
            case "central-igbo" -> Dialect.CENTRAL_IGBO;
            default -> throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Unknown dialect");
        };
    }
}
