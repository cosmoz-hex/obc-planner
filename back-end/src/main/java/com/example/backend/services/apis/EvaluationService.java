package com.example.backend.services.apis;

import com.example.backend.dto.EvaluationCreatedResponse;
import com.example.backend.dto.EvaluationDetailResponse;
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
     * Relecture complète d'une évaluation (bilan + détail des mesures) pour
     * la pré-saisie du wizard en édition.
     */
    EvaluationDetailResponse findById(Integer evaluationId);

    /**
     * Crée une évaluation : le bilan synthétique et toutes ses lignes de détail.
     */
    EvaluationCreatedResponse create(EvaluationRequest request);

    /**
     * Met à jour une évaluation : le bilan est mis à jour en place (identité et
     * FK préservées) ; les lignes de détail sont intégralement remplacées.
     */
    void update(Integer evaluationId, EvaluationRequest request);

    /**
     * Supprime une évaluation ainsi que ses lignes de détail (cascade BD sur
     * {@code eval_details}).
     */
    void delete(Integer evaluationId);
}
