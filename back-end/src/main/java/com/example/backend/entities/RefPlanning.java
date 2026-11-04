package com.example.backend.entities;

import com.example.backend.enums.ExerciceType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Planning de référence de la génération de programme, mappé sur la table
 * {@code ref_plannings}.
 *
 * <p>Table de référence autonome (aucune relation) : elle décrit, pour un nombre
 * de séances hebdomadaires donné, l'ordre des séances et des exercices et le type
 * d'exercice attendu.</p>
 */
@Entity
@Table(name = "ref_plannings")
@Data
@NoArgsConstructor
public class RefPlanning {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ref_planning_id")
    private Integer refPlanningId;

    @NotNull
    @Column(name = "weeks_numbers", nullable = false)
    private Integer weeksNumbers;

    @NotNull
    @Column(name = "training_order", nullable = false)
    private Integer trainingOrder;

    @NotNull
    @Column(name = "exercice_order", nullable = false)
    private Integer exerciceOrder;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "exercice_type", nullable = false, length = 10)
    private ExerciceType exerciceType;
}
