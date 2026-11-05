package com.example.backend.repositories;

import com.example.backend.dto.RefPlanningResponse;
import com.example.backend.entities.RefPlanning;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

/**
 * Accès aux données des lignes de planning de référence.
 * La liste paginée est projetée dans {@link RefPlanningResponse} (projection DTO
 * par constructeur) avec deux filtres optionnels.
 */
public interface RefPlanningRepository extends JpaRepository<RefPlanning, Integer> {

    /**
     * Liste paginée, filtrable (format hebdomadaire, numéro de séance) et triable
     * côté serveur. Les filtres sont optionnels : {@code null} désactive le filtre
     * correspondant.
     */
    @Query("""
            SELECT
                r.refPlanningId,
                r.weeksNumbers,
                r.trainingOrder,
                r.exerciceOrder,
                r.exerciceType
            FROM RefPlanning r
            WHERE (:weeksNumbers IS NULL OR r.weeksNumbers = :weeksNumbers)
              AND (:trainingOrder IS NULL OR r.trainingOrder = :trainingOrder)
            """)
    Page<RefPlanningResponse> findAllFiltered(
            @Param("weeksNumbers") Integer weeksNumbers,
            @Param("trainingOrder") Integer trainingOrder,
            Pageable pageable
    );
}
