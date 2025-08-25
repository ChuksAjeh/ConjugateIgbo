package org.conjugateigbo.core.model.enums;

public enum LanguageRequestStatusEnum {
    PENDING("PENDING"),
    APPROVED("APPROVED"),
    DENIED("DENIED");

    private final String status;

    LanguageRequestStatusEnum(String status) {
        this.status = status;
    }

    public static LanguageRequestStatusEnum fromString(String status) {
        for (LanguageRequestStatusEnum s : LanguageRequestStatusEnum.values()) {
            if (s.status.equalsIgnoreCase(status)) {
                return s;
            }
        }
        throw new IllegalArgumentException("No constant with text " + status + " found");
    }

    public String getStatus() {
        return status;
    }
}
