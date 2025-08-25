package org.conjugateigbo.core.model.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;
import lombok.Getter;

/**
 * Enum representing different types of grammar.
 * This enum is used to categorize various grammatical concepts.
 */
@Getter
public enum GrammarTypeEnum {
    TENSE("Tense"),
    CONJUGATION("Conjugation"),
    PARTICLE("Particle"),
    STRUCTURE("Structure"),
    MODIFIER("Modifier");


    private final String type;

    GrammarTypeEnum(String type) {
        this.type = type;
    }


    @JsonCreator
    public static GrammarTypeEnum fromString(String value) {
        for (GrammarTypeEnum type : GrammarTypeEnum.values()) {
            if (type.type.equalsIgnoreCase(value)) {
                return type;
            }
        }
        throw new IllegalArgumentException("Invalid GrammarTypeEnum value: " + value);
    }

    @Override
    @JsonValue
    public String toString() {
        return type;
    }
}
