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
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.math.BigDecimal;

/**
 * Exercice planifié dans une semaine de programme, mappé sur la table
 * {@code programme_trainings}.
 *
 * <p>Rattaché à une {@link ProgrammeWeek} parente. Le nombre de séries
 * ({@code setNumber}) et les répétitions ({@code repNumber}, texte libre :
 * {@code 6}, {@code 30s}, {@code (1 + 1)}, ou NULL) ainsi que les charges
 * ({@code minWeight}/{@code maxWeight}) sont nullables (ex. renfo, pliométrie
 * ou case « à définir »).</p>
 */
@Entity
@Table(name = "programme_trainings")
@Data
@NoArgsConstructor
public class ProgrammeTraining {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "programme_training_id")
    private Integer programmeTrainingId;

    // Exclu de equals/hashCode/toString : relation lazy, éviter chargement et récursion.
    @EqualsAndHashCode.Exclude
    @ToString.Exclude
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "programme_week_id", nullable = false)
    private ProgrammeWeek programmeWeek;

    @NotNull
    @Column(name = "training_number", nullable = false)
    private Integer trainingNumber;

    @NotNull
    @Column(name = "exercice_order", nullable = false)
    private Integer exerciceOrder;

    // length=255 : couvre les libellés composés Épaulé + Jeté (jusqu'à ~203 car.),
    // cf. migration V20261020_140000__programme_training_name_length.sql.
    @NotNull
    @Column(name = "exercice_name", nullable = false, length = 255)
    private String exerciceName;

    @Column(name = "set_number")
    private Integer setNumber;

    @Column(name = "rep_number", length = 20)
    private String repNumber;

    // length=50 : couvre les labels combinés Épaulé + Jeté "(repsCL + repsJK)"
    // (jusqu'à ~46 car.), cf. migration V20261020_180000__programme_training_rep_label_length.sql.
    @Column(name = "rep_label", length = 50)
    private String repLabel;

    @Column(name = "min_weight", precision = 6, scale = 2)
    private BigDecimal minWeight;

    @Column(name = "max_weight", precision = 6, scale = 2)
    private BigDecimal maxWeight;
}
