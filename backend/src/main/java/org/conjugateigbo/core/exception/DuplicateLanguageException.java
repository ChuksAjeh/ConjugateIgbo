package org.conjugateigbo.core.exception;

public class DuplicateLanguageException extends RuntimeException {
    public DuplicateLanguageException(String message) {
        super(message);
    }

    public DuplicateLanguageException() {
        super();
    }

    public DuplicateLanguageException(String message, Throwable cause) {
        super(message, cause);
    }
}
