package com.example.backend.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;

import java.util.List;

/**
 * Payload d'édition en bloc d'une case de la grille d'un programme : l'ensemble
 * des exercices (alternatives « au choix » et leurs séries) d'un couple
 * ({@code weekNumber}, {@code trainingNumber}, {@code exerciceOrder}).
 *
 * <p>Le service remplace en bloc les exercices planifiés de la case : suppression
 * des exercices absents, mise à jour des présents (nom + séries), insertion des
 * nouveaux.</p>
 */
public record ProgrammeCellUpdateRequest(
        @NotNull Integer weekNumber,
        @NotNull Integer trainingNumber,
        @NotNull Integer exerciceOrder,
        @Valid List<CellExerciceRequest> exercices
) {
}
