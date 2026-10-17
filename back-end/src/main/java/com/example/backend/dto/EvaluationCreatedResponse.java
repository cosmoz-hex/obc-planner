package com.example.backend.dto;

/**
 * Réponse à la création d'une évaluation : identifiant du bilan créé.
 * Suffit au frontend pour confirmer et rafraîchir la liste.
 */
public record EvaluationCreatedResponse(Integer evaluationId) {
}
