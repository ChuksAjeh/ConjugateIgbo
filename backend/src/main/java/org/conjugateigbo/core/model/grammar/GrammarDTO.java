package org.conjugateigbo.core.model.grammar;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;
import org.conjugateigbo.core.model.enums.GrammarTypeEnum;
import org.springframework.data.annotation.Id;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
public class GrammarDTO {
    @Id
    private String id;
    private String title;
    private String nativeScript;
    @JsonProperty("type")
    private GrammarTypeEnum type;
    private String description;
    private String rule;
    private List<GrammarExampleDTO> examples;
    private String languageId;
    private String audioFileId;
    private String audioBase64;

    @JsonProperty("isVerified")
    private boolean isVerified;
    private LocalDateTime createdAt;
    private LocalDateTime lastVerifiedAt;

    public GrammarDTO(String title, String nativeScript, GrammarTypeEnum type, String description, String rule, List<GrammarExampleDTO> examples, String languageId, String audioFileId, String audioBase64) {
        this.title = title;
        this.nativeScript = nativeScript;
        this.description = description;
        this.type = type;
        this.rule = rule;
        this.examples = examples;
        this.languageId = languageId;
        this.audioFileId = audioFileId;
        this.audioBase64 = audioBase64;
        this.isVerified = true;
        this.lastVerifiedAt = LocalDateTime.now();
        this.createdAt = LocalDateTime.now();
    }
}
