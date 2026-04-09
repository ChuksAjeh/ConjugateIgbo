package org.conjugateigbo.core.model.dto;

/**
 * Data Transfer Object representing audio metadata for a verb recording.
 *
 * <p>Populated from the {@code audio_assets} table. The {@code objectKey} can
 * be used with cloud storage (e.g. Google Cloud Storage) to generate a signed
 * URL, which is returned to clients as a redirect by
 * {@code VerbController.audio()}.
 *
 * @param objectKey   Storage object key / path within the bucket.
 * @param contentType MIME type of the audio file (e.g. {@code "audio/mpeg"}).
 * @param durationMs  Duration of the audio clip in milliseconds, or {@code null}
 *                    if not yet measured.
 * @param bytes       File size in bytes, or {@code null} if not yet recorded.
 */
public record AudioDTO(String objectKey, String contentType, Integer durationMs, Long bytes) {
}
