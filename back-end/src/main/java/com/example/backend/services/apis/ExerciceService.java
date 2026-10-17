package com.example.backend.services.apis;

import com.example.backend.dto.ExerciceRequest;
import com.example.backend.dto.ExerciceResponse;
import com.example.backend.dto.PageResponse;
import com.example.backend.enums.CategorieExercice;
import com.example.backend.enums.TypeExercice;
import org.springframework.data.domain.Pageable;

/**
 * Service métier des exercices de référence.
 */
public interface ExerciceService {

    /** Liste paginée, filtrée (type, catégorie) et triée côté serveur. */
    PageResponse<ExerciceResponse> findAll(TypeExercice typeExercice, CategorieExercice categorieExercice, Pageable pageable);

    /** Consultation d'un exercice par son identifiant. */
    ExerciceResponse findById(Integer exerciceId);

    /** Création d'un exercice (code unique). */
    ExerciceResponse create(ExerciceRequest request);

    /** Modification d'un exercice existant. */
    ExerciceResponse update(Integer exerciceId, ExerciceRequest request);

    /** Suppression d'un exercice. */
    void delete(Integer exerciceId);
}
