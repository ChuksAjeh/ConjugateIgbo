package org.conjugateigbo.core.model.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;
import lombok.Getter;

@Getter
public enum WordTypeEnum {

    NOUN("Noun"),
    VERB("Verb"),
    ADJECTIVE("Adjective"),
    ADVERB("Adverb"),
    PRONOUN("Pronoun"),
    PREPOSITION("Preposition"),
    CONJUNCTION("Conjunction"),
    INTERJECTION("Interjection"),
    DETERMINER("Determiner"),
    NUMERAL("Numeral"),
    ARTICLE("Article"),
    PARTICLE("Particle"),
    PHRASE("Phrase"),
    IDIOM("Idiom"),
    PROVERB("Proverb"),
    ABBREVIATION("Abbreviation"),
    ACRONYM("Acronym"),
    PREFIX("Prefix"),
    SUFFIX("Suffix"),
    SYMBOL("Symbol"),
    VOWEL("Vowel"),
    LETTER("Letter"),
    NUMBER("Number"),
    OTHER("Other");


    private final String type;

    WordTypeEnum(String type) {
        this.type = type;
    }

    @JsonCreator
    public static WordTypeEnum fromString(String value) {
        for (WordTypeEnum type : WordTypeEnum.values()) {
            if (type.type.equalsIgnoreCase(value)) {
                return type;
            }
        }
        throw new IllegalArgumentException("Invalid WordTypeEnum value: " + value);
    }

    @Override
    @JsonValue
    public String toString() {
        return type;
    }
}
