package org.conjugateigbo.core.model.grammar;

import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.Id;

@Getter
@Setter
public class GrammarExampleDTO {
    @Id
    private String id;
    private String originalText;
    private String nativeScript;
    private String translation;
    private String pronunciation;
}
