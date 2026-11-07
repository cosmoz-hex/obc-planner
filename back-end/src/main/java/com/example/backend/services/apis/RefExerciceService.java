package com.example.backend.services.apis;

import com.example.backend.dto.PageResponse;
import com.example.backend.dto.RefExerciceRequest;
import com.example.backend.dto.RefExerciceResponse;
import com.example.backend.enums.Archetype;
import com.example.backend.enums.ExerciceType;
import com.example.backend.enums.RefGoal;
import com.example.backend.enums.WeekTypeRef;
import org.springframework.data.domain.Pageable;

/** Opérations métier sur les exercices de référence et leurs séries. */
public interface RefExerciceService {

    /** Liste paginée, filtrée (type d'exercice, type de semaine, objectif, archétype) et triée côté serveur. */
    PageResponse<RefExerciceResponse> findAll(ExerciceType exerciceType, WeekTypeRef weekType,
                                              RefGoal goal, Archetype archetype, Pageable pageable);

    /** Consultation d'un exercice de référence (avec ses séries) par son identifiant. */
    RefExerciceResponse findById(Integer refExerciceId);

    /** Création d'un exercice de référence et de ses séries (persistance en cascade). */
    RefExerciceResponse create(RefExerciceRequest request);

    /**
     * Modification d'un exercice : met à jour le libellé et remplace en bloc les
     * séries des archétypes présents dans le payload, en conservant les séries des
     * autres archétypes.
     */
    RefExerciceResponse update(Integer refExerciceId, RefExerciceRequest request);

    /** Suppression d'un exercice de référence et de toutes ses séries (cascade). */
    void delete(Integer refExerciceId);

    /**
     * Retire les séries d'un archétype donné d'un exercice. Si l'exercice n'a plus
     * aucune série, il est supprimé.
     */
    void deleteArchetypeSets(Integer refExerciceId, Archetype archetype);
}
