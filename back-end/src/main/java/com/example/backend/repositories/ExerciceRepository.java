package com.example.backend.repositories;

import com.example.backend.dto.ExerciceResponse;
import com.example.backend.entities.Exercice;
import com.example.backend.enums.CategorieExercice;
import com.example.backend.enums.TypeExercice;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

/**
 * Accès aux exercices de référence.
 */
public interface ExerciceRepository extends JpaRepository<Exercice, Integer> {

    /**
     * Liste paginée, filtrable (type, catégorie) et triable côté serveur. Les
     * filtres sont optionnels : {@code null} désactive le filtre correspondant.
     * L'identifiant de l'exercice de référence est projeté sans charger la relation.
     */
    @Query("""
            SELECT new com.example.backend.dto.ExerciceResponse(
                e.exerciceId,
                e.exerciceRef.exerciceId,
                e.typeExercice,
                e.categorieExercice,
                e.exerciceCode,
                e.estimateValue
            )
            FROM Exercice e
            WHERE (:typeExercice IS NULL OR e.typeExercice = :typeExercice)
              AND (:categorieExercice IS NULL OR e.categorieExercice = :categorieExercice)
            """)
    Page<ExerciceResponse> findAllFiltered(
            @Param("typeExercice") TypeExercice typeExercice,
            @Param("categorieExercice") CategorieExercice categorieExercice,
            Pageable pageable
    );

    /** Indique si un exercice porte déjà ce code — garantit l'unicité à la création. */
    boolean existsByExerciceCode(String exerciceCode);

    /** Variante excluant un identifiant donné — pour la modification. */
    boolean existsByExerciceCodeAndExerciceIdNot(String exerciceCode, Integer exerciceId);
}
