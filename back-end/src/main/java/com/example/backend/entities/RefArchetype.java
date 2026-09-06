package com.example.backend.entities;

import com.example.backend.enums.Archetype;
import com.example.backend.enums.Endurance;
import com.example.backend.enums.StrengthSpeed;
import com.example.backend.enums.Technique;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;

/**
 * Entité JPA d'un archétype de référence, mappée sur la table {@code ref_archetypes}.
 * Associe une combinaison de profils (force-vitesse, technique, endurance) à un archétype.
 * Les validators sont cohérents avec le DDL (NOT NULL, contraintes CHECK).
 */
@Entity
@Table(name = "ref_archetypes")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RefArchetype {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ref_archetype_id")
    private Integer refArchetypeId;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "archetype", nullable = false, length = 10)
    private Archetype archetype;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "strength_speed", nullable = false, length = 10)
    private StrengthSpeed strengthSpeed;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "technique", nullable = false, length = 10)
    private Technique technique;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "endurance", nullable = false, length = 10)
    private Endurance endurance;
}
