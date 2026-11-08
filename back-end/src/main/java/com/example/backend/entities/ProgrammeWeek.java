package com.example.backend.entities;

import com.example.backend.enums.ProgrammeWeekType;
import jakarta.persistence.CascadeType;
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
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;
import org.hibernate.annotations.BatchSize;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

/**
 * Semaine d'un programme d'entraînement, mappée sur la table
 * {@code programme_weeks}.
 *
 * <p>Rattachée à un {@link Programme} parent, porte le type de semaine, la base
 * (pourcentage de l'objectif) et les six objectifs de charge de la semaine
 * (Arraché, Épaulé-Jeté, Flexion Nuque, Flexion Avant, Tirage Arraché, Tirage
 * Épaulé). Porte la collection de ses séances ({@link ProgrammeTraining}) en
 * relation One-Many.</p>
 */
@Entity
@Table(name = "programme_weeks")
@Data
@NoArgsConstructor
public class ProgrammeWeek {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "programme_week_id")
    private Integer programmeWeekId;

    // Exclu de equals/hashCode/toString : relation lazy, éviter chargement et récursion.
    @EqualsAndHashCode.Exclude
    @ToString.Exclude
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "programme_id", nullable = false)
    private Programme programme;

    @NotNull
    @Column(name = "week_number", nullable = false)
    private Integer weekNumber;

    @NotNull
    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @NotNull
    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "week_type", nullable = false, length = 50)
    private ProgrammeWeekType weekType;

    @NotNull
    @Column(name = "base_percent", nullable = false, precision = 5, scale = 2)
    private BigDecimal basePercent;

    @NotNull
    @Column(name = "snatch_goal", nullable = false)
    private Integer snatchGoal;

    @NotNull
    @Column(name = "cj_goal", nullable = false)
    private Integer cjGoal;

    @NotNull
    @Column(name = "back_squat_goal", nullable = false)
    private Integer backSquatGoal;

    @NotNull
    @Column(name = "front_squat_goal", nullable = false)
    private Integer frontSquatGoal;

    @NotNull
    @Column(name = "snatch_pull_goal", nullable = false)
    private Integer snatchPullGoal;

    @NotNull
    @Column(name = "cj_pull_goal", nullable = false)
    private Integer cjPullGoal;

    // Exclu de equals/hashCode/toString : relation lazy, éviter chargement et récursion.
    // @BatchSize : les trainings des semaines chargées sont récupérés en lot (un seul
    // IN (...)) plutôt qu'en N+1, ce qui permet de garder un @EntityGraph sur la seule
    // collection programmeWeeks (évite le MultipleBagFetchException / produit cartésien).
    @EqualsAndHashCode.Exclude
    @ToString.Exclude
    @BatchSize(size = 32)
    @OneToMany(mappedBy = "programmeWeek", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<ProgrammeTraining> programmeTrainings = new ArrayList<>();
}
