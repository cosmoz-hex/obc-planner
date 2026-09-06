package com.example.backend.dto;

import com.example.backend.enums.Archetype;
import com.example.backend.enums.Endurance;
import com.example.backend.enums.StrengthSpeed;
import com.example.backend.enums.Technique;

/**
 * Représentation d'un archétype de référence renvoyée au frontend.
 */
public record RefArchetypeResponse(
        Integer refArchetypeId,
        Archetype archetype,
        StrengthSpeed strengthSpeed,
        Technique technique,
        Endurance endurance
) {
}
