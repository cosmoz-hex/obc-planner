package com.example.backend.controllers;

import com.example.backend.dto.ExerciceRequest;
import com.example.backend.dto.ExerciceResponse;
import com.example.backend.dto.PageResponse;
import com.example.backend.enums.CategorieExercice;
import com.example.backend.enums.TypeExercice;
import com.example.backend.services.apis.ExerciceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * API REST de gestion des exercices de référence. Pagination, filtres (type,
 * catégorie) et tri sont gérés côté serveur via {@link Pageable}.
 */
@RestController
@RequestMapping("/exercices")
@RequiredArgsConstructor
public class ExerciceController {

    private final ExerciceService exerciceService;

    /**
     * Liste paginée des exercices.
     *
     * <p>Le paramètre {@code size=0} désactive la pagination et retourne tous les
     * résultats, tout en conservant le tri.</p>
     */
    @GetMapping
    public PageResponse<ExerciceResponse> list(
            @RequestParam(required = false) TypeExercice typeExercice,
            @RequestParam(required = false) CategorieExercice categorieExercice,
            @RequestParam(name = "size", required = false) Integer size,
            Pageable pageable) {
        Pageable effective = (size == null || size == 0) ? Pageable.unpaged(pageable.getSort()) : pageable;
        return exerciceService.findAll(typeExercice, categorieExercice, effective);
    }

    @GetMapping("/{exerciceId}")
    public ExerciceResponse get(@PathVariable Integer exerciceId) {
        return exerciceService.findById(exerciceId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ExerciceResponse create(@Valid @RequestBody ExerciceRequest request) {
        return exerciceService.create(request);
    }

    @PutMapping("/{exerciceId}")
    public ExerciceResponse update(@PathVariable Integer exerciceId,
                                   @Valid @RequestBody ExerciceRequest request) {
        return exerciceService.update(exerciceId, request);
    }

    @DeleteMapping("/{exerciceId}")
    public ResponseEntity<Void> delete(@PathVariable Integer exerciceId) {
        exerciceService.delete(exerciceId);
        return ResponseEntity.noContent().build();
    }
}
