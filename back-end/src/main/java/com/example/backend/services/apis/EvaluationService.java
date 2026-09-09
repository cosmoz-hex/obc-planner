package com.example.backend.services.apis;

import com.example.backend.dto.EvaluationResponse;
import com.example.backend.dto.PageResponse;
import org.springframework.data.domain.Pageable;

/** Opérations de lecture sur les évaluations. */
public interface EvaluationService {

    /**
     * Liste paginée et triée côté serveur des évaluations (une ligne par
     * évaluation). Tri par défaut : date d'évaluation décroissante.
     */
    PageResponse<EvaluationResponse> findAll(Pageable pageable);
}
