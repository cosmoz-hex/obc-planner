package com.example.backend.entities;

import com.example.backend.enums.Archetype;
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
 * Timeline de référence de la génération de programme, mappée sur la table
 * {@code ref_timelines}.
 *
 * <p>Pour un archétype et une durée de programme ({@code weeks} ∈ {8, 12, 16}),
 * décrit la séquence des types de semaine (chaîne {@code timeline}, ex.
 * {@code F/T/S/A/D/PC}) consommée par le moteur de génération. Table autonome,
 * aucune relation.</p>
 */
@Entity
@Table(name = "ref_timelines")
@Data
@NoArgsConstructor
public class RefTimeline {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ref_timeline_id")
    private Integer refTimelineId;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "archetype", nullable = false, length = 10)
    private Archetype archetype;

    @NotNull
    @Column(name = "weeks", nullable = false)
    private Integer weeks;

    @NotNull
    @Column(name = "timeline", nullable = false, length = 255)
    private String timeline;
}
