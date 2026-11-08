package com.example.backend.repositories;

import com.example.backend.dto.ProgrammeResponse;
import com.example.backend.entities.Programme;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

/**
 * Accès aux données des programmes d'entraînement.
 *
 * <p>La liste paginée est projetée dans {@link ProgrammeResponse} (projection DTO
 * par nom de colonne aliasé) via une jointure explicite
 * {@code eval_summaries → athletes}, ce qui aplati le nom de l'athlète sans
 * chargement lazy par ligne (aucun N+1). Le détail charge l'arbre complet
 * (semaines + exercices planifiés) via {@link EntityGraph}.</p>
 */
public interface ProgrammeRepository extends JpaRepository<Programme, Integer> {

    /**
     * Liste paginée et triable côté serveur, une ligne par programme, avec le nom
     * de l'athlète joint. Le filtre {@code athleteId} est optionnel : {@code null}
     * le désactive.
     */
    @Query("""
            SELECT
                p.programmeId AS programmeId,
                a.firstName AS athleteFirstName,
                a.lastName AS athleteLastName,
                p.startDate AS startDate,
                p.weeks AS weeks,
                p.frequency AS frequency,
                p.snatchGoal AS snatchGoal,
                p.cjGoal AS cjGoal
            FROM Programme p
            JOIN EvalSummary e ON e.evaluationId = p.evaluationId
            JOIN e.athlete a
            WHERE (:athleteId IS NULL OR a.athleteId = :athleteId)
            """)
    Page<ProgrammeResponse> findAllFiltered(@Param("athleteId") Integer athleteId, Pageable pageable);

    /**
     * Charge un programme et ses semaines ({@code programmeWeeks}) en une requête.
     *
     * <p>Une seule collection {@code List} est chargée via {@link EntityGraph}
     * (plus de double collection imbriquée, qui provoquait un
     * {@code MultipleBagFetchException} / produit cartésien). Les niveaux
     * inférieurs (séances {@code programmeTrainings} → exercices → séries) sont
     * chargés en lot grâce aux {@code @BatchSize} portés par chaque collection,
     * ce qui évite le N+1 ligne par ligne.</p>
     */
    @EntityGraph(attributePaths = {"programmeWeeks"})
    Optional<Programme> findWithWeeksByProgrammeId(Integer programmeId);
}
