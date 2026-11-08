package com.example.backend.repositories;

import com.example.backend.entities.ProgrammeWeek;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

/**
 * Accès aux données des semaines de programme.
 *
 * <p>La persistance en cascade est assurée par la collection
 * {@code Programme.programmeWeeks} (cascade {@code ALL} + {@code orphanRemoval}).
 * Ce repository offre un accès ciblé à une semaine d'un programme, en complément,
 * pour l'édition de cellule.</p>
 */
public interface ProgrammeWeekRepository extends JpaRepository<ProgrammeWeek, Integer> {

    /** Semaine d'un programme par son numéro. */
    Optional<ProgrammeWeek> findByProgramme_ProgrammeIdAndWeekNumber(Integer programmeId, Integer weekNumber);
}
