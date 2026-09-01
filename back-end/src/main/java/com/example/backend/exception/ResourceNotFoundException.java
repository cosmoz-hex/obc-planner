package com.example.backend.exception;

/** Levée quand une ressource demandée est introuvable (HTTP 404). */
public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String message) {
        super(message);
    }
}
