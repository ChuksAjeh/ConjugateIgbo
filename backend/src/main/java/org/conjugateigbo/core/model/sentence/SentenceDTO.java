package org.conjugateigbo.core.model.sentence;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;
import org.conjugateigbo.core.model.enums.SentenceTypeEnum;
import org.springframework.data.annotation.Id;

import java.time.LocalDateTime;

@Getter
@Setter
public class SentenceDTO {
    @Id
    private String id;
    private String sentence;
    private String nativeScript;
    private String translation;
    private SentenceTypeEnum partOfSpeech;
    private String context;
    private String example;
    private String pronunciationTip;
    private String languageId;
    private String audioFileId;
    private String audioBase64;
    private String imageFileId;
    private String imageBase64;
    @JsonProperty("isVerified")
    private boolean isVerified;
    private LocalDateTime createdAt;
    private LocalDateTime lastVerifiedAt;

    public SentenceDTO(
            String sentence,
            String nativeScript,
            String translation,
            SentenceTypeEnum partOfSpeech,
            String context,
            String example,
            String pronunciationTip,
            String languageId,
            String audioFileId,
            String audioBase64,
            String imageFileId,
            String imageBase64) {
        this.sentence = sentence;
        this.nativeScript = nativeScript;
        this.translation = translation;
        this.partOfSpeech = partOfSpeech;
        this.context = context;
        this.example = example;
        this.pronunciationTip = pronunciationTip;
        this.languageId = languageId;
        this.audioFileId = audioFileId;
        this.audioBase64 = audioBase64;
        this.imageFileId = imageFileId;
        this.imageBase64 = imageBase64;
        this.isVerified = true;
        this.lastVerifiedAt = LocalDateTime.now();
        this.createdAt = LocalDateTime.now();
    }
}
