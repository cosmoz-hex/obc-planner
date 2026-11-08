package com.example.backend.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;

import java.util.List;

/**
 * Payload d'édition en bloc d'une case de la grille d'un programme : l'ensemble
 * des lignes (alternatives / séries) d'un couple
 * ({@code weekNumber}, {@code trainingNumber}, {@code exerciceOrder}).
 *
 * <p>Le service remplace en bloc les exercices planifiés de la case : suppression
 * des lignes absentes, mise à jour des présentes, insertion des nouvelles.</p>
 */
public record ProgrammeCellUpdateRequest(
        @NotNull Integer weekNumber,
        @NotNull Integer trainingNumber,
        @NotNull Integer exerciceOrder,
        @Valid List<CellLineRequest> lines
) {
}
