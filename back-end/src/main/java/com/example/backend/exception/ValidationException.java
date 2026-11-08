package com.example.backend.exception;

/** Levée quand une valeur reçue est hors du domaine fonctionnel autorisé (HTTP 400). */
public class ValidationException extends RuntimeException {
    public ValidationException(String message) {
        super(message);
    }
}
