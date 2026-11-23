package com.example.backend.services.mapper;

import com.example.backend.dto.EvalDetailRequest;
import com.example.backend.dto.EvalDetailResponse;
import com.example.backend.dto.EvaluationDetailResponse;
import com.example.backend.dto.EvaluationRequest;
import com.example.backend.dto.ProgrammeProfileRequest;
import com.example.backend.entities.Athlete;
import com.example.backend.entities.EvalDetail;
import com.example.backend.entities.EvalSummary;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;
import java.util.Objects;

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
        summary.setSnatch(request.snatch());
        summary.setClean(request.clean());
        summary.setJerk(request.jerk());
        summary.setPsychoStrength(request.psychoStrength());
        summary.setPsychoWeakness(request.psychoWeakness());
    }

    /**
     * Compare la synthèse d'une évaluation au profil saisi (RG3, 10 champs).
     * Normalisations : {@code musculation} nul → 0 ; points faibles vides → nul.
     */
    public boolean matches(EvalSummary summary, ProgrammeProfileRequest profile) {
        return summary.getArchetype() == profile.archetype()
                && summary.getStrengthSpeed() == profile.strengthSpeed()
                && summary.getTechnique() == profile.technique()
                && summary.getEndurance() == profile.endurance()
                && summary.getSquat() == profile.squat()
                && summary.getPull() == profile.pull()
                && Objects.equals(normalizeMusculation(summary.getMusculation()),
                        normalizeMusculation(profile.musculation()))
                && Objects.equals(blankToNull(summary.getSnatch()), blankToNull(profile.snatch()))
                && Objects.equals(blankToNull(summary.getClean()), blankToNull(profile.clean()))
                && Objects.equals(blankToNull(summary.getJerk()), blankToNull(profile.jerk()));
    }

    /** Cas (a) : nouvelle évaluation depuis la synthèse saisie (psychologie nulle). */
    public EvalSummary toNewSummary(ProgrammeProfileRequest profile, Athlete athlete, LocalDate date) {
        EvalSummary summary = new EvalSummary();
        summary.setAthlete(athlete);
        summary.setEvaluationDate(date);
        applyProfile(summary, profile);
        return summary;
    }

    /**
     * Cas (c) : duplication de la source avec la synthèse modifiée. Athlète et psychologie
     * sont repris de la source, qui n'est jamais modifiée.
     */
    public EvalSummary toDuplicatedSummary(EvalSummary source, ProgrammeProfileRequest profile, LocalDate date) {
        EvalSummary summary = new EvalSummary();
        summary.setAthlete(source.getAthlete());
        summary.setEvaluationDate(date);
        applyProfile(summary, profile);
        summary.setPsychoStrength(source.getPsychoStrength());
        summary.setPsychoWeakness(source.getPsychoWeakness());
        return summary;
    }

    /** Copie d'une ligne de détail vers un nouveau bilan ({@code result} recopié sans recalcul). */
    public EvalDetail copyDetail(EvalDetail source, EvalSummary target) {
        EvalDetail detail = new EvalDetail();
        detail.setEvaluation(target);
        detail.setEvalCategorie(source.getEvalCategorie());
        detail.setExerciceCode(source.getExerciceCode());
        detail.setRealValue(source.getRealValue());
        detail.setResult(source.getResult());
        return detail;
    }

    private void applyProfile(EvalSummary summary, ProgrammeProfileRequest profile) {
        summary.setArchetype(profile.archetype());
        summary.setStrengthSpeed(profile.strengthSpeed());
        summary.setTechnique(profile.technique());
        summary.setEndurance(profile.endurance());
        summary.setSquat(profile.squat());
        summary.setPull(profile.pull());
        summary.setMusculation(normalizeMusculation(profile.musculation()));
        summary.setSnatch(blankToNull(profile.snatch()));
        summary.setClean(blankToNull(profile.clean()));
        summary.setJerk(blankToNull(profile.jerk()));
    }

    private static Integer normalizeMusculation(Integer value) {
        return value != null ? value : 0;
    }

    private static String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value;
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
                summary.getSnatch(),
                summary.getClean(),
                summary.getJerk(),
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
