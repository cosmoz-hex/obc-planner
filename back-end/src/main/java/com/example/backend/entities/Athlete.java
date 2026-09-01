package com.example.backend.entities;

import com.example.backend.enums.AgeCategorie;
import com.example.backend.enums.CompLevel;
import com.example.backend.enums.Sexe;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

/**
 * Entité JPA de la fiche athlète, mappée sur la table {@code athletes}.
 * Les validators sont cohérents avec le DDL (longueurs, NOT NULL, contraintes CHECK).
 */
@Entity
@Table(name = "athletes")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Athlete {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "athlete_id")
    private Integer athleteId;

    @NotBlank
    @Size(max = 50)
    @Column(name = "first_name", nullable = false, length = 50)
    private String firstName;

    @NotBlank
    @Size(max = 50)
    @Column(name = "last_name", nullable = false, length = 50)
    private String lastName;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "sexe", nullable = false, columnDefinition = "varchar(1)")
    private Sexe sexe;

    @Enumerated(EnumType.STRING)
    @Column(name = "age_categorie", length = 10)
    private AgeCategorie ageCategorie;

    /**
     * Catégorie de poids (kg) — stockée en {@code INTEGER}. La cohérence avec le sexe
     * (listes distinctes H/F) est contrôlée dans la couche service.
     */
    @Column(name = "weight_categorie")
    private Integer weightCategorie;

    @Enumerated(EnumType.STRING)
    @Column(name = "comp_level", length = 10)
    private CompLevel compLevel;
}
