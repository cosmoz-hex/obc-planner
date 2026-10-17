package com.example.backend.services.mapper;

import com.example.backend.dto.EvalDetailRequest;
import com.example.backend.dto.EvalDetailResponse;
import com.example.backend.dto.EvaluationDetailResponse;
import com.example.backend.dto.EvaluationRequest;
import com.example.backend.entities.Athlete;
import com.example.backend.entities.EvalDetail;
import com.example.backend.entities.EvalSummary;
import org.springframework.stereotype.Component;

import java.util.List;

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
        applySummary(summary, request);
        return summary;
    }

    /**
     * Met à jour un bilan existant à partir de la requête, en préservant son
     * identité et ses relations (notamment les FK vers d'autres tables).
     */
    public void updateSummary(EvalSummary summary, EvaluationRequest request) {
        applySummary(summary, request);
    }

    /** Applique les champs du bilan communs à la création et à la mise à jour. */
    private void applySummary(EvalSummary summary, EvaluationRequest request) {
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

    /** Vue de relecture complète d'une évaluation (bilan + détail des mesures). */
    public EvaluationDetailResponse toDetailResponse(EvalSummary summary, List<EvalDetail> details) {
        return new EvaluationDetailResponse(
                summary.getEvaluationId(),
                summary.getAthlete().getAthleteId(),
                summary.getEvaluationDate(),
                summary.getArchetype(),
                summary.getStrengthSpeed(),
                summary.getTechnique(),
                summary.getEndurance(),
                summary.getSquat(),
                summary.getPull(),
                summary.getMusculation(),
                summary.getSnatchStrength(),
                summary.getSnatchWeakness(),
                summary.getCleanStrength(),
                summary.getCleanWeakness(),
                summary.getJerkStrength(),
                summary.getJerkWeakness(),
                summary.getPsychoStrength(),
                summary.getPsychoWeakness(),
                details.stream().map(this::toDetailResponse).toList()
        );
    }

    /** Vue de relecture d'une ligne de détail. */
    public EvalDetailResponse toDetailResponse(EvalDetail detail) {
        return new EvalDetailResponse(
                detail.getEvalCategorie(),
                detail.getExerciceCode(),
                detail.getRealValue(),
                detail.getResult()
        );
    }
}
