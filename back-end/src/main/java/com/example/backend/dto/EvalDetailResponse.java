package com.example.backend.dto;

import com.example.backend.enums.EvalCategorie;

import java.math.BigDecimal;

/**
 * Ligne de détail renvoyée lors de la relecture d'une évaluation ({@code eval_details}).
 * Sert à pré-remplir les étapes de mesure du wizard en mode édition.
 */
public record EvalDetailResponse(
        EvalCategorie evalCategorie,
        String exerciceCode,
        BigDecimal realValue,
        Integer result
) {
}
