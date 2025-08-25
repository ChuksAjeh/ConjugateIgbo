package org.conjugateigbo.core.exception;

public class LanguageNotFoundException extends RuntimeException {
    public LanguageNotFoundException(String message) {
        super(message);
    }

    public LanguageNotFoundException() {
        super();
    }

    public LanguageNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }

    public LanguageNotFoundException(Throwable cause) {
        super(cause);
    }
}
