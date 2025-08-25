package org.conjugateigbo.core.controller;

import com.mongodb.client.gridfs.model.GridFSFile;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.InputStreamResource;
import org.springframework.data.mongodb.gridfs.GridFsOperations;
import org.springframework.data.mongodb.gridfs.GridFsResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;

import static org.springframework.data.mongodb.core.query.Criteria.where;
import static org.springframework.data.mongodb.core.query.Query.query;

@RestController
@RequestMapping("/api/files")
public class FileController {

    private static final Logger LOGGER = LoggerFactory.getLogger(FileController.class);

    @Autowired
    private GridFsOperations gridFsOperations;

    @GetMapping("/audio/{fileId}")
    public ResponseEntity<?> getAudio(@PathVariable String fileId) throws IOException {
        LOGGER.debug("Fetching audio file with ID: {}", fileId);
        return streamFile(fileId, "audio/webm");
    }

    @GetMapping("/image/{fileId}")
    public ResponseEntity<?> getImage(@PathVariable String fileId) throws IOException {
        LOGGER.debug("Fetching image file with ID: {}", fileId);
        return streamFile(fileId, "image/png");
    }

    private ResponseEntity<?> streamFile(String fileId, String defaultType) throws IOException {
        LOGGER.debug("Streaming file with ID: {}", fileId);
        GridFSFile file = gridFsOperations.findOne(query(where("_id").is(fileId)));
        if (file == null) {
            LOGGER.warn("File not found with ID: {}", fileId);
            return ResponseEntity.notFound().build();
        }

        GridFsResource resource = gridFsOperations.getResource(file);
        MediaType contentType = MediaType.parseMediaType(
                file.getMetadata() != null && file.getMetadata().get("_contentType") != null
                        ? file.getMetadata().get("_contentType").toString()
                        : defaultType
        );

        LOGGER.info("File with ID: {} found and being streamed as {}", fileId, contentType);
        return ResponseEntity.ok()
                .contentType(contentType)
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                .body(new InputStreamResource(resource.getInputStream()));
    }
}
