package com.example.backend.entities;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;
import org.hibernate.annotations.BatchSize;

import java.util.ArrayList;
import java.util.List;

/**
 * Exercice planifié d'une séance de programme, mappé sur la table
 * {@code programme_exercices}.
 *
 * <p>Rattaché à une {@link ProgrammeTraining} (séance) parente et positionné par
 * son {@code exerciceOrder} (plusieurs exercices au même ordre = alternatives
 * « au choix »). Porte la collection de ses séries ({@link ProgrammeSeries}) en
 * relation One-Many.</p>
 */
@Entity
@Table(name = "programme_exercices")
@Data
@NoArgsConstructor
public class ProgrammeExercice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "programme_exercice_id")
    private Integer programmeExerciceId;

    // Exclu de equals/hashCode/toString : relation lazy, éviter chargement et récursion.
    @EqualsAndHashCode.Exclude
    @ToString.Exclude
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "programme_training_id", nullable = false)
    private ProgrammeTraining programmeTraining;

    @NotNull
    @Column(name = "exercice_order", nullable = false)
    private Integer exerciceOrder;

    // length=255 : couvre les libellés composés Épaulé + Jeté.
    @NotNull
    @Column(name = "exercice_name", nullable = false, length = 255)
    private String exerciceName;

    // Exclu de equals/hashCode/toString : relation lazy, éviter chargement et récursion.
    // @BatchSize : chargement en lot des séries (aligné sur la hiérarchie supérieure).
    @EqualsAndHashCode.Exclude
    @ToString.Exclude
    @BatchSize(size = 32)
    @OneToMany(mappedBy = "programmeExercice", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<ProgrammeSeries> programmeSeries = new ArrayList<>();
}
