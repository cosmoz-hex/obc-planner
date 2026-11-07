package com.example.backend.services.mapper;

import com.example.backend.dto.RefExerciceRequest;
import com.example.backend.dto.RefExerciceResponse;
import com.example.backend.dto.RefExerciceSetRequest;
import com.example.backend.dto.RefExerciceSetResponse;
import com.example.backend.entities.RefExercice;
import com.example.backend.entities.RefExerciceSet;

import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

/** Conversions entre l'entité {@link RefExercice} (avec ses séries) et ses DTOs. */
@Component
public class RefExerciceMapper {

    /**
     * Construit un exercice et sa collection de séries à partir du payload. Chaque
     * série est rattachée à l'exercice (côté {@code @ManyToOne}) pour maintenir la
     * cohérence de la relation One-Many avant persistance en cascade.
     */
    public RefExercice toEntity(RefExerciceRequest request) {
        RefExercice refExercice = new RefExercice();
        refExercice.setExerciceType(request.exerciceType());
        refExercice.setWeekType(request.weekType());
        refExercice.setGoal(request.goal());
        refExercice.setTrainingOrder(request.trainingOrder());
        refExercice.setExerciceName(request.exerciceName());
        refExercice.setReference(request.reference());
        setsFromRequest(request.sets()).forEach(set -> addSet(refExercice, set));
        return refExercice;
    }

    /**
     * Met à jour les champs scalaires d'un exercice existant. La gestion des séries
     * (remplacement par archétype, orphanRemoval) est portée par le service.
     */
    public void updateEntity(RefExercice refExercice, RefExerciceRequest request) {
        refExercice.setExerciceType(request.exerciceType());
        refExercice.setWeekType(request.weekType());
        refExercice.setGoal(request.goal());
        refExercice.setTrainingOrder(request.trainingOrder());
        refExercice.setExerciceName(request.exerciceName());
        refExercice.setReference(request.reference());
    }

    /** Construit la liste des entités séries à partir des payloads (relation non encore positionnée). */
    public List<RefExerciceSet> setsFromRequest(List<RefExerciceSetRequest> requests) {
        return Optional.ofNullable(requests)
                .orElseGet(List::of)
                .stream()
                .map(this::toSetEntity)
                .toList();
    }

    /** Rattache une série à son exercice (positionne le côté {@code @ManyToOne}) et l'ajoute à la collection. */
    public void addSet(RefExercice refExercice, RefExerciceSet set) {
        set.setRefExercice(refExercice);
        refExercice.getSets().add(set);
    }

    public RefExerciceResponse toResponse(RefExercice refExercice) {
        return new RefExerciceResponse(
                refExercice.getRefExerciceId(),
                refExercice.getExerciceType(),
                refExercice.getWeekType(),
                refExercice.getGoal(),
                refExercice.getTrainingOrder(),
                refExercice.getExerciceName(),
                refExercice.getReference(),
                refExercice.getSets().stream().map(this::toSetResponse).toList()
        );
    }

    private RefExerciceSet toSetEntity(RefExerciceSetRequest request) {
        RefExerciceSet set = new RefExerciceSet();
        set.setArchetype(request.archetype());
        set.setSetNumber(request.setNumber());
        set.setRepNumber(request.repNumber());
        set.setWeight(request.weight());
        return set;
    }

    private RefExerciceSetResponse toSetResponse(RefExerciceSet set) {
        return new RefExerciceSetResponse(
                set.getRefExerciceSetId(),
                set.getArchetype(),
                set.getSetNumber(),
                set.getRepNumber(),
                set.getWeight()
        );
    }
}
