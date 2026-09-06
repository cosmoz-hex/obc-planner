package com.example.backend.services.impl;

import com.example.backend.dto.RefArchetypeRequest;
import com.example.backend.dto.RefArchetypeResponse;
import com.example.backend.entities.RefArchetype;

import org.springframework.stereotype.Component;

/** Conversions entre l'entité {@link RefArchetype} et ses DTOs. */
@Component
public class RefArchetypeMapper {

    public RefArchetype toEntity(RefArchetypeRequest request) {
        return RefArchetype.builder()
                .archetype(request.archetype())
                .strengthSpeed(request.strengthSpeed())
                .technique(request.technique())
                .endurance(request.endurance())
                .build();
    }

    public void updateEntity(RefArchetype refArchetype, RefArchetypeRequest request) {
        refArchetype.setArchetype(request.archetype());
        refArchetype.setStrengthSpeed(request.strengthSpeed());
        refArchetype.setTechnique(request.technique());
        refArchetype.setEndurance(request.endurance());
    }

    public RefArchetypeResponse toResponse(RefArchetype refArchetype) {
        return new RefArchetypeResponse(
                refArchetype.getRefArchetypeId(),
                refArchetype.getArchetype(),
                refArchetype.getStrengthSpeed(),
                refArchetype.getTechnique(),
                refArchetype.getEndurance()
        );
    }
}
