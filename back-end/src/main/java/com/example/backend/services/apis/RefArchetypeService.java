package com.example.backend.services.apis;

import com.example.backend.dto.PageResponse;
import com.example.backend.dto.RefArchetypeRequest;
import com.example.backend.dto.RefArchetypeResponse;
import com.example.backend.enums.Archetype;
import com.example.backend.enums.Endurance;
import com.example.backend.enums.StrengthSpeed;
import com.example.backend.enums.Technique;
import org.springframework.data.domain.Pageable;

/** Opérations métier sur les archétypes de référence. */
public interface RefArchetypeService {

    /** Liste paginée, filtrée (archétype, force-vitesse, technique, endurance) et triée côté serveur. */
    PageResponse<RefArchetypeResponse> findAll(Archetype archetype, StrengthSpeed strengthSpeed,
                                               Technique technique, Endurance endurance, Pageable pageable);

    /** Consultation d'un archétype par son identifiant. */
    RefArchetypeResponse findById(Integer refArchetypeId);

    /** Création d'un archétype (combinaison de profils unique). */
    RefArchetypeResponse create(RefArchetypeRequest request);

    /** Modification d'un archétype existant. */
    RefArchetypeResponse update(Integer refArchetypeId, RefArchetypeRequest request);

    /** Suppression d'un archétype. */
    void delete(Integer refArchetypeId);
}
