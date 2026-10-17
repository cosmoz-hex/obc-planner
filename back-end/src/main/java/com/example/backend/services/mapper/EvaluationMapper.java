package com.example.backend.services.mapper;

import com.example.backend.dto.EvalDetailRequest;
import com.example.backend.dto.EvaluationRequest;
import com.example.backend.entities.Athlete;
import com.example.backend.entities.EvalDetail;
import com.example.backend.entities.EvalSummary;
import org.springframework.stereotype.Component;

/** Conversions du payload d'évaluation vers les entités {@link EvalSummary} / {@link EvalDetail}. */
@Component
public class EvaluationMapper {

    /**
     * Construit le bilan à partir de la requête et de l'athlète résolu.
     * {@code musculation} nul est normalisé à 0 (bitmask vide).
     */
    public EvalSummary toSummary(EvaluationRequest request, Athlete athlete) {
        EvalSummary summary = new EvalSummary();
        summary.setAthlete(athlete);
        summary.setEvaluationDate(request.evaluationDate());
        summary.setArchetype(request.archetype());
        summary.setStrengthSpeed(request.strengthSpeed());
        summary.setTechnique(request.technique());
        summary.setEndurance(request.endurance());
        summary.setSquat(request.squat());
        summary.setPull(request.pull());
        summary.setMusculation(request.musculation() != null ? request.musculation() : 0);
        summary.setSnatchStrength(request.snatchStrength());
        summary.setSnatchWeakness(request.snatchWeakness());
        summary.setCleanStrength(request.cleanStrength());
        summary.setCleanWeakness(request.cleanWeakness());
        summary.setJerkStrength(request.jerkStrength());
        summary.setJerkWeakness(request.jerkWeakness());
        summary.setPsychoStrength(request.psychoStrength());
        summary.setPsychoWeakness(request.psychoWeakness());
        return summary;
    }

    /** Construit une ligne de détail rattachée au bilan persisté. */
    public EvalDetail toDetail(EvalDetailRequest request, EvalSummary summary) {
        EvalDetail detail = new EvalDetail();
        detail.setEvaluation(summary);
        detail.setEvalCategorie(request.evalCategorie());
        detail.setExerciceCode(request.exerciceCode());
        detail.setRealValue(request.realValue());
        detail.setResult(request.result());
        return detail;
    }
}
