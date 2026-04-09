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

/**
 * REST controller exposing Igbo verb data endpoints under {@code /api/{dialect}}.
 *
 * <p>All routes accept a {@code {dialect}} path variable that is resolved to a
 * {@link Dialect} enum constant by {@link #dialectEnum(String)}. Unknown dialect
 * slugs return HTTP 404.
 *
 * <h2>Base path</h2>
 * <pre>{@code /api}</pre>
 *
 * <h2>Supported dialect slugs</h2>
 * <ul>
 *   <li>{@code delta-igbo} / {@code delta_igbo} / {@code deltaigbo}</li>
 *   <li>{@code central-igbo} / {@code central_igbo} / {@code centraligbo}</li>
 * </ul>
 */
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
class VerbController {

    private final VerbServiceImpl service;

    /**
     * Returns a paginated, optionally filtered verb list for the given dialect.
     *
     * @param dialect  dialect slug (e.g. {@code delta-igbo}).
     * @param limit    maximum number of verbs to return (default: 100).
     * @param search   optional search string matched case-insensitively against
     *                 the Igbo and English columns.
     * @return list of {@link VerbDTO}s ordered by frequency rank.
     */
    @GetMapping("/{dialect}/verbs")
    List<VerbDTO> list(@PathVariable String dialect,
                       @RequestParam(defaultValue = "100") int limit,
                       @RequestParam(required = false) String search) {
        return service.list(dialectEnum(dialect), limit, search);
    }

    /**
     * Returns all verbs for the given dialect without a row limit.
     * Used by the mobile app to populate its local cache on first launch.
     *
     * @param dialect dialect slug (e.g. {@code delta-igbo}).
     * @return complete verb list ordered by frequency rank.
     */
    @GetMapping("/{dialect}/verbs/all")
    List<VerbDTO> listAll(@PathVariable String dialect) {
        return service.listAll(dialectEnum(dialect));
    }

    /**
     * Returns a single verb by its numeric ID.
     *
     * @param dialect dialect slug.
     * @param id      verb primary key.
     * @return the matching {@link VerbDTO}.
     */
    @GetMapping("/{dialect}/verbs/{id}")
    VerbDTO one(@PathVariable String dialect, @PathVariable long id) {
        return service.one(dialectEnum(dialect), id);
    }

    /**
     * Redirects to a short-lived signed URL for streaming a verb's audio recording.
     *
     * <p>Returns HTTP 302 with the signed URL in the {@code Location} header.
     * The URL is valid for 10 minutes.
     *
     * <p><strong>Note:</strong> GCS signed URL generation is not yet fully
     * implemented; the endpoint currently redirects to a placeholder.
     *
     * @param dialect dialect slug.
     * @param id      verb primary key.
     * @return a 302 redirect response.
     */
    @GetMapping("/{dialect}/verbs/{id}/audio")
    ResponseEntity<Void> audio(@PathVariable String dialect, @PathVariable long id) {
        var url = service.signedAudioUrl(dialectEnum(dialect), id, Duration.ofMinutes(10));
        return ResponseEntity.status(302).location(URI.create(url)).build();
    }

    /**
     * Imports verbs from an uploaded {@code .xlsx} file or a server-side file path.
     *
     * <p>At least one of {@code file} or {@code filePath} must be provided.
     * Currently only {@code delta-igbo} is supported; other dialects return HTTP 400.
     *
     * @param dialect  dialect slug — must be {@code delta-igbo}.
     * @param file     multipart Excel file (optional).
     * @param filePath server-side path to an Excel file (optional).
     * @return a summary map with keys {@code totalRows}, {@code inserted}, and
     *         {@code skipped}.
     * @throws Exception if the file cannot be read or parsed.
     */
    @PostMapping(value = "/{dialect}/verbs/import", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    Map<String, Object> importVerbs(@PathVariable String dialect,
                                    @RequestParam(name = "file", required = false) MultipartFile file,
                                    @RequestParam(name = "filePath", required = false) String filePath)
            throws Exception {
        return service.importVerbs(dialectEnum(dialect), file, filePath);
    }

    /**
     * Resolves a dialect path-variable string to the corresponding {@link Dialect} enum constant.
     *
     * @param s the raw path-variable value (case-insensitive; hyphens/underscores tolerated).
     * @return the matching {@link Dialect}.
     * @throws ResponseStatusException with HTTP 404 if no matching dialect exists.
     */
    private Dialect dialectEnum(String s) {
        return switch (s.toLowerCase()) {
            case "delta-igbo", "delta_igbo", "deltaigbo" -> Dialect.DELTA_IGBO;
            case "central-igbo", "central_igbo", "centraligbo" -> Dialect.CENTRAL_IGBO;
            default -> throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Unknown dialect");
        };
    }
}
