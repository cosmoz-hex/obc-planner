package com.example.backend.repositories;

import com.example.backend.entities.ProgrammeTraining;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

/**
 * Accès aux données des exercices planifiés.
 *
 * <p>La persistance en cascade est assurée par la collection
 * {@code ProgrammeWeek.programmeTrainings} (cascade {@code ALL} +
 * {@code orphanRemoval}). Ce repository offre un accès ciblé aux exercices d'une
 * case de la grille (semaine × séance × ordre d'exercice) pour l'édition en bloc.</p>
 */
public interface ProgrammeTrainingRepository extends JpaRepository<ProgrammeTraining, Integer> {

    /** Exercices planifiés d'une case : programme, numéro de semaine, numéro de séance et ordre d'exercice. */
    List<ProgrammeTraining> findByProgrammeWeek_Programme_ProgrammeIdAndProgrammeWeek_WeekNumberAndTrainingNumberAndExerciceOrder(
            Integer programmeId, Integer weekNumber, Integer trainingNumber, Integer exerciceOrder);
}
