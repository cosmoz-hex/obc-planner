package com.example.backend.repositories;

import com.example.backend.entities.RefExercice;
import com.example.backend.enums.Archetype;
import com.example.backend.enums.ExerciceType;
import com.example.backend.enums.RefGoal;
import com.example.backend.enums.WeekTypeRef;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

/**
 * Accès aux données des exercices de référence et de leurs séries.
 *
 * <p>La liste charge la collection {@code sets} via {@link EntityGraph} pour éviter
 * le N+1. Les filtres {@code exerciceType}, {@code weekType} et {@code goal} sont
 * optionnels ({@code null} désactive le filtre). Le filtre {@code archetype} porte
 * sur les séries : seuls les exercices possédant au moins une série de cet archétype
 * sont retournés.</p>
 */
public interface RefExerciceRepository extends JpaRepository<RefExercice, Integer> {

    /**
     * Liste paginée, filtrable et triable côté serveur, avec chargement de la
     * collection de séries. La pagination porte sur les exercices.
     */
    @EntityGraph(attributePaths = "sets")
    @Query("""
            SELECT r
            FROM RefExercice r
            WHERE (:exerciceType IS NULL OR r.exerciceType = :exerciceType)
              AND (:weekType IS NULL OR r.weekType = :weekType)
              AND (:goal IS NULL OR r.goal = :goal)
              AND (:archetype IS NULL OR EXISTS (
                    SELECT 1 FROM RefExerciceSet s
                    WHERE s.refExercice = r AND s.archetype = :archetype))
            """)
    Page<RefExercice> findAllFiltered(
            @Param("exerciceType") ExerciceType exerciceType,
            @Param("weekType") WeekTypeRef weekType,
            @Param("goal") RefGoal goal,
            @Param("archetype") Archetype archetype,
            Pageable pageable
    );

    /**
     * Exercices de référence (avec leurs séries) correspondant exactement à une case
     * de génération : type d'exercice, type de semaine, objectif et ordre dans la
     * séance. Plusieurs résultats = alternatives « au choix ». La collection
     * {@code sets} est chargée via {@link EntityGraph} pour éviter le N+1 lors du
     * parcours des séries par le moteur.
     */
    @EntityGraph(attributePaths = "sets")
    List<RefExercice> findByExerciceTypeAndWeekTypeAndGoalAndTrainingOrder(
            ExerciceType exerciceType, WeekTypeRef weekType, RefGoal goal, Integer trainingOrder);

    /**
     * Tous les exercices de référence (avec leurs séries) d'un objectif donné pour
     * un type d'exercice et un type de semaine, toutes séances confondues, triés par
     * {@code trainingOrder} croissant. Utilisé par le moteur pour construire la file
     * rotative de groupes de musculation (un groupe = les exercices « au choix » d'un
     * même {@code trainingOrder}). La collection {@code sets} est chargée via
     * {@link EntityGraph} pour éviter le N+1 lors de la lecture des séries.
     */
    @EntityGraph(attributePaths = "sets")
    List<RefExercice> findByExerciceTypeAndWeekTypeAndGoalOrderByTrainingOrderAsc(
            ExerciceType exerciceType, WeekTypeRef weekType, RefGoal goal);
}
