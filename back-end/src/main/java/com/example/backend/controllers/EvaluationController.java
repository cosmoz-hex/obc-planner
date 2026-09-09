package com.example.backend.controllers;

import com.example.backend.dto.EvaluationResponse;
import com.example.backend.dto.PageResponse;
import com.example.backend.services.apis.EvaluationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * API REST de consultation des évaluations (lecture seule). Pagination et tri
 * sont gérés côté serveur via {@link Pageable} ; tri par défaut : date
 * d'évaluation décroissante.
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
}
