package com.example.backend.dto;

import com.example.backend.enums.ProgrammeWeekType;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

/**
 * Représentation d'une semaine de programme renvoyée au frontend : en-tête de
 * semaine (type, base en pourcentage, six objectifs de charge) et liste imbriquée
 * de ses exercices planifiés.
 */
public record ProgrammeWeekResponse(
        Integer weekNumber,
        LocalDate startDate,
        LocalDate endDate,
        ProgrammeWeekType weekType,
        BigDecimal basePercent,
        Integer snatchGoal,
        Integer cjGoal,
        Integer backSquatGoal,
        Integer frontSquatGoal,
        Integer snatchPullGoal,
        Integer cjPullGoal,
        List<ProgrammeTrainingResponse> trainings
) {
}
