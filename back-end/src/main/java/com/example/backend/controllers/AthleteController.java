package com.example.backend.controllers;

import com.example.backend.dto.AthleteRequest;
import com.example.backend.dto.AthleteResponse;
import com.example.backend.dto.PageResponse;
import com.example.backend.enums.AgeCategorie;
import com.example.backend.enums.Sexe;
import com.example.backend.services.apis.AthleteService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * API REST de gestion des athlètes. Pagination, filtres (sexe, âge) et tri sont
 * gérés côté serveur via {@link Pageable}.
 */
@RestController
@RequestMapping("/athletes")
@RequiredArgsConstructor
public class AthleteController {

    private final AthleteService athleteService;

    @GetMapping
    public PageResponse<AthleteResponse> list(
            @RequestParam(required = false) Sexe sexe,
            @RequestParam(required = false) AgeCategorie ageCategorie,
            Pageable pageable) {
        return athleteService.findAll(sexe, ageCategorie, pageable);
    }

    @GetMapping("/{athleteId}")
    public AthleteResponse get(@PathVariable Integer athleteId) {
        return athleteService.findById(athleteId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public AthleteResponse create(@Valid @RequestBody AthleteRequest request) {
        return athleteService.create(request);
    }

    @PutMapping("/{athleteId}")
    public AthleteResponse update(@PathVariable Integer athleteId,
                                  @Valid @RequestBody AthleteRequest request) {
        return athleteService.update(athleteId, request);
    }

    @DeleteMapping("/{athleteId}")
    public ResponseEntity<Void> delete(@PathVariable Integer athleteId) {
        athleteService.delete(athleteId);
        return ResponseEntity.noContent().build();
    }
}
