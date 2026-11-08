package com.example.backend.entities;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
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

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

/**
 * Programme d'entraînement généré pour une évaluation, mappé sur la table
 * {@code programmes}.
 *
 * <p>En-tête du programme (durée, fréquence, dates, objectifs Arraché et
 * Épaulé-Jeté). Référence l'évaluation source par une FK simple
 * ({@code evaluation_id}) et porte la collection de ses semaines
 * ({@link ProgrammeWeek}) en relation One-Many.</p>
 */
@Entity
@Table(name = "programmes")
@Data
@NoArgsConstructor
public class Programme {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "programme_id")
    private Integer programmeId;

    @NotNull
    @Column(name = "evaluation_id", nullable = false)
    private Integer evaluationId;

    @NotNull
    @Column(name = "weeks", nullable = false)
    private Integer weeks;

    @NotNull
    @Column(name = "frequency", nullable = false)
    private Integer frequency;

    @Column(name = "duration")
    private Integer duration;

    @NotNull
    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @NotNull
    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @Column(name = "snatch_goal")
    private Integer snatchGoal;

    @Column(name = "cj_goal")
    private Integer cjGoal;

    // Exclu de equals/hashCode/toString : relation lazy, éviter chargement et récursion.
    @EqualsAndHashCode.Exclude
    @ToString.Exclude
    @OneToMany(mappedBy = "programme", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<ProgrammeWeek> programmeWeeks = new ArrayList<>();
}
