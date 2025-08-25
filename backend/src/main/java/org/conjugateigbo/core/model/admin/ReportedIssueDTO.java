package org.conjugateigbo.core.model.admin;

import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Getter
@Setter
@Document(collection = "reportedIssues")
public class ReportedIssueDTO {

    @Id
    private String id;

    private String reportedByUserId;
    private String relatedLanguageId;
    private String issueType;      // e.g. BUG, DATA_ERROR
    private String severity;       // e.g. LOW, MEDIUM, HIGH

    private String description;
    private String status;         // OPEN, RESOLVED, IGNORED

    private String adminResponse;
    private String resolvedByUserId;
    private Instant reportedAt = Instant.now();
    private Instant resolvedAt;
}
