package org.conjugateigbo.core.model.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import lombok.Getter;
import lombok.Setter;


@Getter

public enum SentenceTypeEnum {
    SENTENCE("Sentence"),
    QUESTION("Question"),
    EXCLAMATION("Exclamation"),
    COMMAND("Command");

    @Setter
    private final String type;

    SentenceTypeEnum(String type) {
        this.type = type;
    }

    @JsonCreator
    public static SentenceTypeEnum fromString(String value) {
        for (SentenceTypeEnum type : SentenceTypeEnum.values()) {
            if (type.type.equalsIgnoreCase(value)) {
                return type;
            }
        }
        throw new IllegalArgumentException("Invalid SentenceTypeEnum value: " + value);
    }

    @Override
    public String toString() {
        return super.toString();
    }
}

