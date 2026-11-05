package com.example.backend.services.mapper;

import com.example.backend.dto.RefPlanningRequest;
import com.example.backend.dto.RefPlanningResponse;
import com.example.backend.entities.RefPlanning;

import org.springframework.stereotype.Component;

/** Conversions entre l'entité {@link RefPlanning} et ses DTOs. */
@Component
public class RefPlanningMapper {

    public RefPlanning toEntity(RefPlanningRequest request) {
        return RefPlanning.builder()
                .weeksNumbers(request.weeksNumbers())
                .trainingOrder(request.trainingOrder())
                .exerciceOrder(request.exerciceOrder())
                .exerciceType(request.exerciceType())
                .build();
    }

    public void updateEntity(RefPlanning refPlanning, RefPlanningRequest request) {
        refPlanning.setWeeksNumbers(request.weeksNumbers());
        refPlanning.setTrainingOrder(request.trainingOrder());
        refPlanning.setExerciceOrder(request.exerciceOrder());
        refPlanning.setExerciceType(request.exerciceType());
    }

    public RefPlanningResponse toResponse(RefPlanning refPlanning) {
        return new RefPlanningResponse(
                refPlanning.getRefPlanningId(),
                refPlanning.getWeeksNumbers(),
                refPlanning.getTrainingOrder(),
                refPlanning.getExerciceOrder(),
                refPlanning.getExerciceType()
        );
    }
}
