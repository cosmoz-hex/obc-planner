package com.example.backend.services.apis;

import com.example.backend.dto.EvaluationCreatedResponse;
import com.example.backend.dto.EvaluationRequest;
import com.example.backend.dto.EvaluationResponse;
import com.example.backend.dto.PageResponse;
import org.springframework.data.domain.Pageable;

/** Opérations sur les évaluations. */
public interface EvaluationService {

    /**
     * Liste paginée et triée côté serveur des évaluations (une ligne par
     * évaluation). Tri par défaut : date d'évaluation décroissante.
     */
    PageResponse<EvaluationResponse> findAll(Pageable pageable);

    /**
     * Crée une évaluation : le bilan synthétique et toutes ses lignes de détail.
     */
    EvaluationCreatedResponse create(EvaluationRequest request);
}
