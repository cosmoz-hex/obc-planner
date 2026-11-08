package com.example.backend.controllers;

import com.example.backend.dto.PageResponse;
import com.example.backend.dto.ProgrammeCellUpdateRequest;
import com.example.backend.dto.ProgrammeCreateRequest;
import com.example.backend.dto.ProgrammeDetailResponse;
import com.example.backend.dto.ProgrammeResponse;
import com.example.backend.services.apis.ProgrammeService;
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
 * API REST de gestion des programmes d'entraînement. Pagination, filtre
 * (athlète) et tri sont gérés côté serveur via {@link Pageable}. La création
 * déclenche la génération du programme ; aucune logique métier n'est portée par
 * le controller (délégation pure au service).
 */
@RestController
@RequestMapping("/programmes")
@RequiredArgsConstructor
public class ProgrammeController {

    private final ProgrammeService programmeService;

    /**
     * Liste paginée des programmes, filtrable par athlète.
     *
     * <p>Le paramètre {@code size=0} désactive la pagination et retourne tous les
     * résultats. Spring Data refuse une taille de page nulle (le resolver la
     * remplace par la valeur par défaut) : on intercepte donc ce cas ici en
     * transmettant un {@link Pageable} non paginé, tout en conservant le tri.</p>
     */
    @GetMapping
    public PageResponse<ProgrammeResponse> list(
            @RequestParam(required = false) Integer athleteId,
            @RequestParam(name = "size", required = false) Integer size,
            Pageable pageable) {
        Pageable effective = (size == null || size == 0) ? Pageable.unpaged(pageable.getSort()) : pageable;
        return programmeService.findAll(athleteId, effective);
    }

    @GetMapping("/{programmeId}")
    public ProgrammeDetailResponse get(@PathVariable Integer programmeId) {
        return programmeService.findDetail(programmeId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ProgrammeResponse create(@Valid @RequestBody ProgrammeCreateRequest request) {
        return programmeService.create(request);
    }

    @PutMapping("/{programmeId}/cell")
    public ProgrammeDetailResponse updateCell(@PathVariable Integer programmeId,
                                              @Valid @RequestBody ProgrammeCellUpdateRequest request) {
        return programmeService.updateCell(programmeId, request);
    }

    @DeleteMapping("/{programmeId}")
    public ResponseEntity<Void> delete(@PathVariable Integer programmeId) {
        programmeService.delete(programmeId);
        return ResponseEntity.noContent().build();
    }
}
