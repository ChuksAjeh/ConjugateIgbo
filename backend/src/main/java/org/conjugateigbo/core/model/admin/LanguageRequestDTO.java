package org.conjugateigbo.core.model.admin;

import lombok.Getter;
import lombok.Setter;
import org.conjugateigbo.core.model.enums.LanguageRequestStatusEnum;
import org.springframework.data.annotation.Id;

import java.time.Instant;

@Getter
@Setter
public class LanguageRequestDTO {

    @Id
    private String id;

    private String requestedByUserId;
    private String languageName;
    private String country;
    private String continent;
    private boolean isDialect;
    private String parentLanguageName; // Optional if isDialect = true
    private LanguageRequestStatusEnum status; // PENDING, APPROVED, DENIED
    private String adminNote; // Optional note from admin
    private Instant requestedAt = Instant.now();
    private String reviewedByUserId;      // moderator/admin who reviewed
    private Instant reviewedAt;           // already present


    public LanguageRequestDTO(String requestedByUserId, String languageName, String country, String continent, boolean isDialect, String parentLanguageName, LanguageRequestStatusEnum status, String adminNote, Instant requestedAt, String reviewedByUserId, Instant reviewedAt) {
        this.requestedByUserId = requestedByUserId;
        this.languageName = languageName;
        this.country = country;
        this.continent = continent;
        this.isDialect = isDialect;
        this.parentLanguageName = parentLanguageName;
        this.status = status;
        this.adminNote = adminNote;
        this.requestedAt = requestedAt;
        this.reviewedByUserId = reviewedByUserId;
        this.reviewedAt = reviewedAt;
    }

    public LanguageRequestDTO() {
    }
}
