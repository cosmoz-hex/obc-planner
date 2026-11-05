package com.example.backend.services.apis;

import com.example.backend.dto.PageResponse;
import com.example.backend.dto.RefPlanningRequest;
import com.example.backend.dto.RefPlanningResponse;
import org.springframework.data.domain.Pageable;

/** Opérations métier sur les lignes de planning de référence. */
public interface RefPlanningService {

    /** Liste paginée, filtrée (format hebdomadaire, numéro de séance) et triée côté serveur. */
    PageResponse<RefPlanningResponse> findAll(Integer weeksNumbers, Integer trainingOrder, Pageable pageable);

    /** Consultation d'une ligne de planning par son identifiant. */
    RefPlanningResponse findById(Integer refPlanningId);

    /** Création d'une ligne de planning. */
    RefPlanningResponse create(RefPlanningRequest request);

    /** Modification d'une ligne de planning existante. */
    RefPlanningResponse update(Integer refPlanningId, RefPlanningRequest request);

    /** Suppression d'une ligne de planning. */
    void delete(Integer refPlanningId);
}
