package com.example.backend.repositories;

import com.example.backend.dto.EvaluationResponse;
import com.example.backend.entities.EvalSummary;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

/**
 * Accès aux données des évaluations.
 *
 * <p>La liste paginée est projetée directement dans {@link EvaluationResponse}
 * (projection DTO par nom de colonne aliasé) via une jointure explicite avec
 * {@code Athlete}, ce qui aplati le nom de l'athlète sans déclencher de
 * chargement lazy par ligne (aucun N+1).</p>
 */
public interface EvaluationRepository extends JpaRepository<EvalSummary, Integer> {

    /**
     * Liste paginée et triable côté serveur des évaluations, une ligne par
     * évaluation, avec le nom de l'athlète évalué joint.
     */
    @Query("""
            SELECT
                e.evaluationId AS evaluationId,
                a.athleteId AS athleteId,
                a.firstName AS firstName,
                a.lastName AS lastName,
                e.evaluationDate AS evaluationDate,
                e.archetype AS archetype,
                e.strengthSpeed AS strengthSpeed,
                e.technique AS technique,
                e.endurance AS endurance,
                e.psychoStrength AS psychoStrength,
                e.psychoWeakness AS psychoWeakness
            FROM EvalSummary e
            JOIN e.athlete a
            """)
    Page<EvaluationResponse> findAllProjected(Pageable pageable);
}
