package com.example.backend.repositories;

import com.example.backend.dto.AthleteResponse;
import com.example.backend.entities.Athlete;
import com.example.backend.enums.AgeCategorie;
import com.example.backend.enums.Sexe;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

/**
 * Accès aux données des athlètes.
 * La liste paginée est projetée dans {@link AthleteResponse} (projection DTO par nom
 * de colonne) et calcule la dernière date d'évaluation via une sous-requête aliasée,
 * évitant tout N+1.
 */
public interface AthleteRepository extends JpaRepository<Athlete, Integer> {

    /**
     * Liste paginée, filtrable (sexe, catégorie d'âge) et triable côté serveur.
     * Les filtres sont optionnels : {@code null} désactive le filtre correspondant.
     * Chaque colonne est aliasée sur une propriété de {@link AthleteResponse}.
     */
    @Query("""
            SELECT
                a.athleteId,
                a.firstName,
                a.lastName,
                a.sexe,
                a.ageCategorie,
                a.weightCategorie,
                a.compLevel,
                (SELECT MAX(e.evaluationDate) FROM EvalSummary e WHERE e.athlete = a) AS lastEvaluationDate
            FROM Athlete a
            WHERE (:sexe IS NULL OR a.sexe = :sexe)
              AND (:ageCategorie IS NULL OR a.ageCategorie = :ageCategorie)
            """)
    Page<AthleteResponse> findAllFiltered(
            @Param("sexe") Sexe sexe,
            @Param("ageCategorie") AgeCategorie ageCategorie,
            Pageable pageable
    );
}
