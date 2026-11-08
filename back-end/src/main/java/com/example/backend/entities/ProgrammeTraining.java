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
 * Séance planifiée d'une semaine de programme, mappée sur la table
 * {@code programme_trainings}.
 *
 * <p>Rattachée à une {@link ProgrammeWeek} parente et identifiée par son
 * {@code trainingNumber} (1 à 5). Porte la collection de ses exercices
 * ({@link ProgrammeExercice}) en relation One-Many.</p>
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

    // Exclu de equals/hashCode/toString : relation lazy, éviter chargement et récursion.
    // @BatchSize : les exercices des séances chargées sont récupérés en lot plutôt
    // qu'en N+1 (aligné sur ProgrammeWeek.programmeTrainings), ce qui permet de garder
    // un @EntityGraph sur la seule collection programmeWeeks (pas de double bag List).
    @EqualsAndHashCode.Exclude
    @ToString.Exclude
    @BatchSize(size = 32)
    @OneToMany(mappedBy = "programmeTraining", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<ProgrammeExercice> programmeExercices = new ArrayList<>();
}
