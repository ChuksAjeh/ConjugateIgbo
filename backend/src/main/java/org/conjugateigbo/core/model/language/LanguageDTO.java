package org.conjugateigbo.core.model.language;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.Id;

@Getter
@Setter
public class LanguageDTO {
    @Id
    private String id;

    private String languageName;
    private String country;
    private String continent;
    @JsonProperty("isDialect")
    private boolean isDialect;
    private String parentLanguageName;
    private String parentLanguageId; // this is to store the parent language if this language is a dialect
    @JsonProperty("isVisible")
    private boolean isVisible;

    public LanguageDTO(String languageName, String country, String continent, boolean isDialect) {
        this.languageName = languageName;
        this.country = country;
        this.continent = continent;
        this.isDialect = isDialect;
        this.parentLanguageId = null;
        this.parentLanguageName = null;
        this.isVisible = true;
    }

    public LanguageDTO(String languageName, String country, String continent, boolean isDialect, String parentLanguageId, String parentLanguageName) {
        this(languageName, country, continent, isDialect);
        this.parentLanguageId = parentLanguageId;
        this.parentLanguageName = parentLanguageName;
    }

    public LanguageDTO(String id, String languageName, String country, String continent, boolean isDialect, String parentLanguageName, String parentLanguageId, boolean isVisible) {
        this(languageName, country, continent, isDialect, parentLanguageId, parentLanguageName);
        this.isVisible = isVisible;
    }

    public LanguageDTO() {
    }
}
