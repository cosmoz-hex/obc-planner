package com.example.backend.controllers;

import com.example.backend.dto.PageResponse;
import com.example.backend.dto.RefPlanningRequest;
import com.example.backend.dto.RefPlanningResponse;
import com.example.backend.services.apis.RefPlanningService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * API REST de gestion des lignes de planning de référence. Pagination, filtres
 * (format hebdomadaire, numéro de séance) et tri sont gérés côté serveur via
 * {@link Pageable}.
 */
@RestController
@RequestMapping("/ref-plannings")
@RequiredArgsConstructor
public class RefPlanningController {

    private final RefPlanningService refPlanningService;

    /**
     * Liste paginée des lignes de planning.
     *
     * <p>Le paramètre {@code size=0} désactive la pagination et retourne tous les
     * résultats. Spring Data refuse une taille de page nulle (le resolver la
     * remplace par la valeur par défaut) : on intercepte donc ce cas ici en
     * transmettant un {@link Pageable} non paginé, tout en conservant le tri.</p>
     */
    @GetMapping
    public PageResponse<RefPlanningResponse> list(
            @RequestParam(required = false) Integer weeksNumbers,
            @RequestParam(required = false) Integer trainingOrder,
            @RequestParam(name = "size", required = false) Integer size,
            Pageable pageable) {
        Pageable effective = (size == null || size == 0) ? Pageable.unpaged(pageable.getSort()) : pageable;
        return refPlanningService.findAll(weeksNumbers, trainingOrder, effective);
    }

    @GetMapping("/{refPlanningId}")
    public RefPlanningResponse get(@PathVariable Integer refPlanningId) {
        return refPlanningService.findById(refPlanningId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public RefPlanningResponse create(@Valid @RequestBody RefPlanningRequest request) {
        return refPlanningService.create(request);
    }

    @PutMapping("/{refPlanningId}")
    public RefPlanningResponse update(@PathVariable Integer refPlanningId,
                                      @Valid @RequestBody RefPlanningRequest request) {
        return refPlanningService.update(refPlanningId, request);
    }

    @DeleteMapping("/{refPlanningId}")
    public ResponseEntity<Void> delete(@PathVariable Integer refPlanningId) {
        refPlanningService.delete(refPlanningId);
        return ResponseEntity.noContent().build();
    }
}
