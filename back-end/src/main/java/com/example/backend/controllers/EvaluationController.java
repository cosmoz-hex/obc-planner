package com.example.backend.controllers;

import com.example.backend.dto.EvaluationCreatedResponse;
import com.example.backend.dto.EvaluationDetailResponse;
import com.example.backend.dto.EvaluationRequest;
import com.example.backend.dto.EvaluationResponse;
import com.example.backend.dto.PageResponse;
import com.example.backend.services.apis.EvaluationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

/**
 * API REST des évaluations. La liste est paginée et triée côté serveur via
 * {@link Pageable} (tri par défaut : date d'évaluation décroissante) ; la
 * création persiste le bilan et son détail.
 */
@RestController
@RequestMapping("/evaluations")
@RequiredArgsConstructor
public class EvaluationController {

    private final EvaluationService evaluationService;

    /**
     * Liste paginée des évaluations (une ligne par évaluation).
     *
     * <p>Le paramètre {@code size=0} désactive la pagination et retourne tous les
     * résultats : Spring Data refusant une taille de page nulle, on transmet un
     * {@link Pageable} non paginé tout en conservant le tri.</p>
     */
    @GetMapping
    public PageResponse<EvaluationResponse> list(
            @RequestParam(name = "size", required = false) Integer size,
            Pageable pageable) {
        Pageable effective = (size == null || size == 0) ? Pageable.unpaged(pageable.getSort()) : pageable;
        return evaluationService.findAll(effective);
    }

    /** Crée une évaluation (bilan synthétique + détail des mesures). */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public EvaluationCreatedResponse create(@Valid @RequestBody EvaluationRequest request) {
        return evaluationService.create(request);
    }

    /** Relecture complète d'une évaluation (bilan + détail), pour l'édition. */
    @GetMapping("/{evaluationId}")
    public EvaluationDetailResponse get(@PathVariable Integer evaluationId) {
        return evaluationService.findById(evaluationId);
    }

    /** Met à jour une évaluation (bilan mis à jour en place, détail remplacé). */
    @PutMapping("/{evaluationId}")
    public ResponseEntity<Void> update(@PathVariable Integer evaluationId,
                                       @Valid @RequestBody EvaluationRequest request) {
        evaluationService.update(evaluationId, request);
        return ResponseEntity.noContent().build();
    }

    /** Supprime une évaluation (détail des mesures supprimé en cascade). */
    @DeleteMapping("/{evaluationId}")
    public ResponseEntity<Void> delete(@PathVariable Integer evaluationId) {
        evaluationService.delete(evaluationId);
        return ResponseEntity.noContent().build();
    }
}
