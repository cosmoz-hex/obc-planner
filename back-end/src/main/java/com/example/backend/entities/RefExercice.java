package com.example.backend.entities;

import com.example.backend.enums.ExerciceType;
import com.example.backend.enums.RefGoal;
import com.example.backend.enums.RefReference;
import com.example.backend.enums.WeekTypeRef;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.util.ArrayList;
import java.util.List;

/**
 * Exercice de référence de la génération de programme, mappé sur la table
 * {@code ref_exercices}.
 *
 * <p>Décrit un exercice attendu pour un type d'exercice, un type de semaine et
 * un objectif donnés, avec sa référence de charge (nullable pour la
 * musculation). Porte la collection de ses jeux de séries
 * ({@link RefExerciceSet}) en relation One-Many.</p>
 */
@Entity
@Table(name = "ref_exercices")
@Data
@NoArgsConstructor
public class RefExercice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ref_exercice_id")
    private Integer refExerciceId;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "exercice_type", nullable = false, length = 10)
    private ExerciceType exerciceType;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "week_type", nullable = false, length = 10)
    private WeekTypeRef weekType;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "goal", nullable = false, length = 10)
    private RefGoal goal;

    @NotNull
    @Column(name = "training_order", nullable = false)
    private Integer trainingOrder;

    @NotNull
    @Column(name = "exercice_name", nullable = false, length = 100)
    private String exerciceName;

    @Enumerated(EnumType.STRING)
    @Column(name = "reference", nullable = true, length = 10)
    private RefReference reference;

    // Exclu de equals/hashCode/toString : relation lazy, éviter chargement et récursion.
    @EqualsAndHashCode.Exclude
    @ToString.Exclude
    @OneToMany(mappedBy = "refExercice", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<RefExerciceSet> sets = new ArrayList<>();
}
