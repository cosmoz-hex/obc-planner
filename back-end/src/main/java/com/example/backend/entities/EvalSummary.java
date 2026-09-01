package com.example.backend.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
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
 * Vue minimale de la table {@code eval_summaries}, limitée aux colonnes nécessaires
 * au calcul de la dernière évaluation d'un athlète. Le mapping complet des bilans
 * d'évaluation relève d'une autre fonctionnalité.
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
}
