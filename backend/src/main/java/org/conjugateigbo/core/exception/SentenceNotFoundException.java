package org.conjugateigbo.core.exception;

public class SentenceNotFoundException extends RuntimeException {
    public SentenceNotFoundException(String message) {
        super(message);
    }

    public SentenceNotFoundException() {
        super();
    }

    public SentenceNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }

    public SentenceNotFoundException(Throwable cause) {
        super(cause);
    }
}
