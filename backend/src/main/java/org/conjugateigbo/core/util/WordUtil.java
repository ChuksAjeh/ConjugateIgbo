package org.conjugateigbo.core.util;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.InputStreamResource;
import org.springframework.data.mongodb.gridfs.GridFsResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

@Component
public class WordUtil {

    @Autowired
    private FileStorageUtil fileStorageUtil;

    // ✅ Restrict verification updates to every 4 weeks
    public boolean canVerifyWord(LocalDateTime lastVerifiedAt) {
        return lastVerifiedAt == null || lastVerifiedAt.isBefore(LocalDateTime.now().minus(4, ChronoUnit.WEEKS));
    }

    // ✅ Retrieve audio file from GridFS
    public ResponseEntity<InputStreamResource> getAudioResponse(String audioFileId) throws IOException {
        if (audioFileId == null) {
            return ResponseEntity.ok().body(null);
        }

        GridFsResource audioResource = fileStorageUtil.getFileResource(audioFileId);
        if (audioResource == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(audioResource.getContentType()))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + audioResource.getFilename() + "\"")
                .body(new InputStreamResource(audioResource.getInputStream()));
    }
}
