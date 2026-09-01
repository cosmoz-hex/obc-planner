package com.example.backend.exception;

/** Levée quand une règle métier empêche l'opération (HTTP 409). */
public class BusinessRuleException extends RuntimeException {
    public BusinessRuleException(String message) {
        super(message);
    }
}
