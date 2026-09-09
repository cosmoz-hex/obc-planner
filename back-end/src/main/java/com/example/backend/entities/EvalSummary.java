package com.example.backend.entities;

import com.example.backend.enums.Archetype;
import com.example.backend.enums.Endurance;
import com.example.backend.enums.PsychoStrength;
import com.example.backend.enums.PsychoWeakness;
import com.example.backend.enums.StrengthSpeed;
import com.example.backend.enums.Technique;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.time.LocalDate;

/**
 * Bilan synthétique d'une évaluation athlète, mappé sur la table {@code eval_summaries}.
 *
 * <p>Seules les colonnes exploitées par les fonctionnalités actuelles sont mappées :
 * l'identité de l'évaluation, l'athlète évalué, la date, les profils résultants
 * (archétype, force-vitesse, technique, endurance) et les axes psychologiques.
 * Le reste des colonnes du bilan relève d'autres fonctionnalités.</p>
 */
@Entity
@Table(name = "eval_summaries")
@Data
@NoArgsConstructor
public class EvalSummary {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "evaluation_id")
    private Integer evaluationId;

    // Exclu de equals/hashCode/toString : relation lazy, éviter chargement et récursion.
    @EqualsAndHashCode.Exclude
    @ToString.Exclude
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "athlete_id", nullable = false)
    private Athlete athlete;

    @Column(name = "evaluation_date", nullable = false)
    private LocalDate evaluationDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "archetype", length = 10)
    private Archetype archetype;

    @Enumerated(EnumType.STRING)
    @Column(name = "strength_speed", length = 10)
    private StrengthSpeed strengthSpeed;

    @Enumerated(EnumType.STRING)
    @Column(name = "technique", length = 10)
    private Technique technique;

    @Enumerated(EnumType.STRING)
    @Column(name = "endurance", length = 10)
    private Endurance endurance;

    @Enumerated(EnumType.STRING)
    @Column(name = "psycho_strength", length = 100)
    private PsychoStrength psychoStrength;

    @Enumerated(EnumType.STRING)
    @Column(name = "psycho_weakness", length = 100)
    private PsychoWeakness psychoWeakness;
}
