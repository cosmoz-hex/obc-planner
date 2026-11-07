package com.example.backend.controllers;

import com.example.backend.dto.PageResponse;
import com.example.backend.dto.RefExerciceRequest;
import com.example.backend.dto.RefExerciceResponse;
import com.example.backend.enums.Archetype;
import com.example.backend.enums.ExerciceType;
import com.example.backend.enums.RefGoal;
import com.example.backend.enums.WeekTypeRef;
import com.example.backend.services.apis.RefExerciceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * API REST de gestion des exercices de référence et de leurs séries. Pagination,
 * filtres (type d'exercice, type de semaine, objectif, archétype) et tri sont gérés
 * côté serveur via {@link Pageable}.
 */
@RestController
@RequestMapping("/ref-exercices")
@RequiredArgsConstructor
public class RefExerciceController {

    private final RefExerciceService refExerciceService;

    /**
     * Liste paginée des exercices de référence (avec leurs séries).
     *
     * <p>Le paramètre {@code size=0} désactive la pagination et retourne tous les
     * résultats. Spring Data refuse une taille de page nulle (le resolver la
     * remplace par la valeur par défaut) : on intercepte donc ce cas ici en
     * transmettant un {@link Pageable} non paginé, tout en conservant le tri.</p>
     */
    @GetMapping
    public PageResponse<RefExerciceResponse> list(
            @RequestParam(required = false) ExerciceType exerciceType,
            @RequestParam(required = false) WeekTypeRef weekType,
            @RequestParam(required = false) RefGoal goal,
            @RequestParam(required = false) Archetype archetype,
            @RequestParam(name = "size", required = false) Integer size,
            Pageable pageable) {
        Pageable effective = (size == null || size == 0) ? Pageable.unpaged(pageable.getSort()) : pageable;
        return refExerciceService.findAll(exerciceType, weekType, goal, archetype, effective);
    }

    @GetMapping("/{refExerciceId}")
    public RefExerciceResponse get(@PathVariable Integer refExerciceId) {
        return refExerciceService.findById(refExerciceId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public RefExerciceResponse create(@Valid @RequestBody RefExerciceRequest request) {
        return refExerciceService.create(request);
    }

    @PutMapping("/{refExerciceId}")
    public RefExerciceResponse update(@PathVariable Integer refExerciceId,
                                      @Valid @RequestBody RefExerciceRequest request) {
        return refExerciceService.update(refExerciceId, request);
    }

    @DeleteMapping("/{refExerciceId}")
    public ResponseEntity<Void> delete(@PathVariable Integer refExerciceId) {
        refExerciceService.delete(refExerciceId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{refExerciceId}/sets")
    public ResponseEntity<Void> deleteArchetypeSets(@PathVariable Integer refExerciceId,
                                                    @RequestParam Archetype archetype) {
        refExerciceService.deleteArchetypeSets(refExerciceId, archetype);
        return ResponseEntity.noContent().build();
    }
}
