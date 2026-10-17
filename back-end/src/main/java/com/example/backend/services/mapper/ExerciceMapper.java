package com.example.backend.services.mapper;

import com.example.backend.dto.ExerciceRequest;
import com.example.backend.dto.ExerciceResponse;
import com.example.backend.entities.Exercice;
import org.springframework.stereotype.Component;

import java.util.Optional;

/**
 * Conversions entre l'entité {@link Exercice} et ses DTOs.
 *
 * <p>L'exercice de référence est fourni en argument : il est résolu en amont par
 * le service (afin de valider son existence), le mapper restant sans accès au
 * repository.</p>
 */
@Component
public class ExerciceMapper {

    public Exercice toEntity(ExerciceRequest request, Exercice exerciceRef) {
        Exercice exercice = new Exercice();
        applyRequest(exercice, request, exerciceRef);
        return exercice;
    }

    public void updateEntity(Exercice exercice, ExerciceRequest request, Exercice exerciceRef) {
        applyRequest(exercice, request, exerciceRef);
    }

    public ExerciceResponse toResponse(Exercice exercice) {
        return new ExerciceResponse(
                exercice.getExerciceId(),
                Optional.ofNullable(exercice.getExerciceRef()).map(Exercice::getExerciceId).orElse(null),
                exercice.getTypeExercice(),
                exercice.getCategorieExercice(),
                exercice.getExerciceCode(),
                exercice.getEstimateValue()
        );
    }

    private void applyRequest(Exercice exercice, ExerciceRequest request, Exercice exerciceRef) {
        exercice.setTypeExercice(request.typeExercice());
        exercice.setCategorieExercice(request.categorieExercice());
        exercice.setExerciceCode(request.exerciceCode());
        exercice.setEstimateValue(request.estimateValue());
        exercice.setExerciceRef(exerciceRef);
    }
}
