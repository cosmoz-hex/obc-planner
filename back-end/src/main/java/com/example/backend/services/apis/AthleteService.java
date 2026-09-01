package com.example.backend.services.apis;

import com.example.backend.dto.AthleteRequest;
import com.example.backend.dto.AthleteResponse;
import com.example.backend.dto.PageResponse;
import com.example.backend.enums.AgeCategorie;
import com.example.backend.enums.Sexe;
import org.springframework.data.domain.Pageable;

/** Opérations métier sur les athlètes. */
public interface AthleteService {

    /** Liste paginée, filtrée (sexe, âge) et triée côté serveur. */
    PageResponse<AthleteResponse> findAll(Sexe sexe, AgeCategorie ageCategorie, Pageable pageable);

    /** Consultation d'un athlète par son identifiant. */
    AthleteResponse findById(Integer athleteId);

    /** Création d'un athlète. */
    AthleteResponse create(AthleteRequest request);

    /** Modification d'un athlète existant. */
    AthleteResponse update(Integer athleteId, AthleteRequest request);

    /** Suppression d'un athlète */
    void delete(Integer athleteId);
}
