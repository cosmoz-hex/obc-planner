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

import java.math.BigDecimal;

/**
 * Série planifiée d'un exercice de programme, mappée sur la table
 * {@code programme_series}.
 *
 * <p>Rattachée à un {@link ProgrammeExercice} parent. Le nombre de séries
 * ({@code setNumber}) et les répétitions ({@code repNumber}, texte libre :
 * {@code 6}, {@code 30s}, {@code (1 + 1)}, le libellé combiné Épaulé-Jeté, ou
 * NULL) ainsi que les charges ({@code minWeight}/{@code maxWeight}) sont
 * nullables (renfo, pliométrie, case « à définir » ou volume sans charge).</p>
 */
@Entity
@Table(name = "programme_series")
@Data
@NoArgsConstructor
public class ProgrammeSeries {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "programme_series_id")
    private Integer programmeSeriesId;

    // Exclu de equals/hashCode/toString : relation lazy, éviter chargement et récursion.
    @EqualsAndHashCode.Exclude
    @ToString.Exclude
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "programme_exercice_id", nullable = false)
    private ProgrammeExercice programmeExercice;

    @Column(name = "set_number")
    private Integer setNumber;

    // length=50 : aligné sur la colonne programme_series.rep_number (VARCHAR(50)),
    // élargi pour absorber le libellé combiné Épaulé-Jeté (ex-rep_label, ~46 car.).
    @Column(name = "rep_number", length = 50)
    private String repNumber;

    @Column(name = "min_weight", precision = 6, scale = 2)
    private BigDecimal minWeight;

    @Column(name = "max_weight", precision = 6, scale = 2)
    private BigDecimal maxWeight;
}
