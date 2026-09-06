package com.example.backend.controllers;

import com.example.backend.dto.PageResponse;
import com.example.backend.dto.RefArchetypeRequest;
import com.example.backend.dto.RefArchetypeResponse;
import com.example.backend.enums.Archetype;
import com.example.backend.enums.Endurance;
import com.example.backend.enums.StrengthSpeed;
import com.example.backend.enums.Technique;
import com.example.backend.services.apis.RefArchetypeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * API REST de gestion des archétypes de référence. Pagination, filtres
 * (archétype, force-vitesse, technique, endurance) et tri sont gérés côté
 * serveur via {@link Pageable}.
 */
@RestController
@RequestMapping("/ref-archetypes")
@RequiredArgsConstructor
public class RefArchetypeController {

    private final RefArchetypeService refArchetypeService;

    /**
     * Liste paginée des archétypes.
     *
     * <p>Le paramètre {@code size=0} désactive la pagination et retourne tous les
     * résultats. Spring Data refuse une taille de page nulle (le resolver la
     * remplace par la valeur par défaut) : on intercepte donc ce cas ici en
     * transmettant un {@link Pageable} non paginé, tout en conservant le tri.</p>
     */
    @GetMapping
    public PageResponse<RefArchetypeResponse> list(
            @RequestParam(required = false) Archetype archetype,
            @RequestParam(required = false) StrengthSpeed strengthSpeed,
            @RequestParam(required = false) Technique technique,
            @RequestParam(required = false) Endurance endurance,
            @RequestParam(name = "size", required = false) Integer size,
            Pageable pageable) {
        Pageable effective = (size == null || size == 0) ? Pageable.unpaged(pageable.getSort()) : pageable;
        return refArchetypeService.findAll(archetype, strengthSpeed, technique, endurance, effective);
    }

    @GetMapping("/{refArchetypeId}")
    public RefArchetypeResponse get(@PathVariable Integer refArchetypeId) {
        return refArchetypeService.findById(refArchetypeId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public RefArchetypeResponse create(@Valid @RequestBody RefArchetypeRequest request) {
        return refArchetypeService.create(request);
    }

    @PutMapping("/{refArchetypeId}")
    public RefArchetypeResponse update(@PathVariable Integer refArchetypeId,
                                       @Valid @RequestBody RefArchetypeRequest request) {
        return refArchetypeService.update(refArchetypeId, request);
    }

    @DeleteMapping("/{refArchetypeId}")
    public ResponseEntity<Void> delete(@PathVariable Integer refArchetypeId) {
        refArchetypeService.delete(refArchetypeId);
        return ResponseEntity.noContent().build();
    }
}
