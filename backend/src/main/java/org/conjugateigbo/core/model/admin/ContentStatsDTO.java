package org.conjugateigbo.core.model.admin;

import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.Id;

@Getter
@Setter
public class ContentStatsDTO {

    @Id
    private String id;

    private String languageName;
    private String country;
    private String continent;

    // Verified counts
    private int totalWords;
    private int totalSentences;
    private int totalGrammarRules;

    // Pending verification counts
    private int pendingWords;
    private int pendingSentences;
    private int pendingGrammarRules;

    private long lastUpdatedEpoch;
    private String lastUpdatedByUserId;
}
