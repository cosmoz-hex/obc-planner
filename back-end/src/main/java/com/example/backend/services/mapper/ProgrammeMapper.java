package com.example.backend.services.mapper;

import com.example.backend.dto.ProgrammeDetailResponse;
import com.example.backend.dto.ProgrammeExerciceResponse;
import com.example.backend.dto.ProgrammeSeriesResponse;
import com.example.backend.dto.ProgrammeTrainingResponse;
import com.example.backend.dto.ProgrammeWeekResponse;
import com.example.backend.entities.Programme;
import com.example.backend.entities.ProgrammeExercice;
import com.example.backend.entities.ProgrammeSeries;
import com.example.backend.entities.ProgrammeTraining;
import com.example.backend.entities.ProgrammeWeek;

import org.springframework.stereotype.Component;

import java.util.Comparator;

/**
 * Conversions entité → DTO de l'arbre d'un programme
 * ({@link Programme} → {@link ProgrammeWeek} → {@link ProgrammeTraining} (séance)
 * → {@link ProgrammeExercice} → {@link ProgrammeSeries}).
 *
 * <p>Aucune logique métier : la génération (construction de l'arbre) et le
 * rattachement des enfants au parent sont portés par les services. La ligne de
 * liste ({@code ProgrammeResponse}) est projetée côté repository (jointure avec
 * l'athlète), donc non mappée ici.</p>
 */
@Component
public class ProgrammeMapper {

    /**
     * Mappe un programme complet (en-tête + semaines + séances + exercices +
     * séries) vers sa réponse imbriquée. Le nom de l'athlète est fourni par
     * l'appelant (résolu à partir de l'évaluation source) car l'entité
     * {@link Programme} ne porte qu'une FK simple vers l'évaluation.
     */
    public ProgrammeDetailResponse toDetailResponse(
            Programme programme, String athleteFirstName, String athleteLastName) {
        return new ProgrammeDetailResponse(
                programme.getProgrammeId(),
                programme.getEvaluationId(),
                athleteFirstName,
                athleteLastName,
                programme.getWeeks(),
                programme.getFrequency(),
                programme.getDuration(),
                programme.getStartDate(),
                programme.getEndDate(),
                programme.getSnatchGoal(),
                programme.getCjGoal(),
                programme.getProgrammeWeeks().stream()
                        .sorted(Comparator.comparing(ProgrammeWeek::getWeekNumber))
                        .map(this::toWeekResponse)
                        .toList()
        );
    }

    /** Mappe une semaine de programme (en-tête + séances triées par numéro de séance). */
    public ProgrammeWeekResponse toWeekResponse(ProgrammeWeek week) {
        return new ProgrammeWeekResponse(
                week.getWeekNumber(),
                week.getStartDate(),
                week.getEndDate(),
                week.getWeekType(),
                week.getBasePercent(),
                week.getSnatchGoal(),
                week.getCjGoal(),
                week.getBackSquatGoal(),
                week.getFrontSquatGoal(),
                week.getSnatchPullGoal(),
                week.getCjPullGoal(),
                week.getProgrammeTrainings().stream()
                        .sorted(Comparator.comparing(ProgrammeTraining::getTrainingNumber))
                        .map(this::toTrainingResponse)
                        .toList()
        );
    }

    /** Mappe une séance (exercices triés par ordre d'exercice). */
    public ProgrammeTrainingResponse toTrainingResponse(ProgrammeTraining training) {
        return new ProgrammeTrainingResponse(
                training.getProgrammeTrainingId(),
                training.getTrainingNumber(),
                training.getProgrammeExercices().stream()
                        .sorted(Comparator.comparing(ProgrammeExercice::getExerciceOrder))
                        .map(this::toExerciceResponse)
                        .toList()
        );
    }

    /** Mappe un exercice planifié (séries triées par ordre d'insertion stable, via l'identifiant). */
    public ProgrammeExerciceResponse toExerciceResponse(ProgrammeExercice exercice) {
        return new ProgrammeExerciceResponse(
                exercice.getProgrammeExerciceId(),
                exercice.getExerciceOrder(),
                exercice.getExerciceName(),
                exercice.getProgrammeSeries().stream()
                        .sorted(Comparator.comparing(ProgrammeSeries::getProgrammeSeriesId,
                                Comparator.nullsLast(Comparator.naturalOrder())))
                        .map(this::toSeriesResponse)
                        .toList()
        );
    }

    /** Mappe une série planifiée. */
    public ProgrammeSeriesResponse toSeriesResponse(ProgrammeSeries series) {
        return new ProgrammeSeriesResponse(
                series.getProgrammeSeriesId(),
                series.getSetNumber(),
                series.getRepNumber(),
                series.getMinWeight(),
                series.getMaxWeight()
        );
    }
}
