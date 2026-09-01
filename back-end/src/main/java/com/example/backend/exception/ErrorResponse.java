package com.example.backend.exception;

import java.time.OffsetDateTime;
import java.util.Map;

/**
 * Réponse d'erreur structurée renvoyée au client (jamais de stack trace).
 * {@code fieldErrors} n'est renseigné que pour les erreurs de validation.
 */
public record ErrorResponse(
        OffsetDateTime timestamp,
        int status,
        String code,
        String message,
        Map<String, String> fieldErrors
) {
    public static ErrorResponse of(int status, String code, String message) {
        return new ErrorResponse(OffsetDateTime.now(), status, code, message, null);
    }

    public static ErrorResponse of(int status, String code, String message, Map<String, String> fieldErrors) {
        return new ErrorResponse(OffsetDateTime.now(), status, code, message, fieldErrors);
    }
}
