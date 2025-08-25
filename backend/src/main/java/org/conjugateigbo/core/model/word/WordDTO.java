package org.conjugateigbo.core.model.word;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;
import org.conjugateigbo.core.model.enums.WordTypeEnum;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Getter
@Setter
@Document(collection = "words")
public class WordDTO {
    @Id
    private String id;

    private String word;
    private String translation;
    @JsonProperty("type")
    private WordTypeEnum type;
    private String definition;
    private String example;
    private String pronunciationTip;

    // GridFS references
    private String audioFileId;
    private String imageFileId;

    private boolean isDialect;
    private String dialectName;

    @JsonProperty("isVerified")
    private boolean isVerified;
    private LocalDateTime addedDate;
    private LocalDateTime lastVerifiedAt;

    private String languageId;
    private LocalDateTime createdAt;

    public WordDTO() {
        this.isVerified = false; // Default to not verified
        this.addedDate = LocalDateTime.now();
        this.createdAt = LocalDateTime.now();
    }

    public WordDTO(
            String word,
            String translation,
            WordTypeEnum type,
            String definition,
            String example,
            String pronunciationTip,
            String languageId,
            String audioFileId,
            String imageFileId) {
        this.word = word;
        this.translation = translation;
        this.type = type;
        this.definition = definition;
        this.example = example;
        this.pronunciationTip = pronunciationTip;
        this.languageId = languageId;
        this.audioFileId = audioFileId;
        this.imageFileId = imageFileId;
        this.isVerified = true;
        this.lastVerifiedAt = LocalDateTime.now(); // Automatically verified at creation
        this.createdAt = LocalDateTime.now();
    }
}
