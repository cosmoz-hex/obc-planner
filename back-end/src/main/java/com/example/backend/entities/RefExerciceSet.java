package com.example.backend.entities;

import com.example.backend.enums.Archetype;
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
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.math.BigDecimal;

/**
 * Jeu de séries de référence rattaché à un {@link RefExercice}, mappé sur la
 * table {@code ref_exercice_sets}.
 *
 * <p>Porte l'archétype ({@code archetype}), le nombre de séries, le nombre de
 * répétitions (texte libre : {@code 6}, {@code 30s}, {@code 1 + 1}, ou NULL) et
 * la charge associée. La seule relation autorisée entre tables de référence est
 * la FK {@code ref_exercice_id} vers {@code ref_exercices}.</p>
 */
@Entity
@Table(name = "ref_exercice_sets")
@Data
@NoArgsConstructor
public class RefExerciceSet {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ref_exercice_set_id")
    private Integer refExerciceSetId;

    // Exclu de equals/hashCode/toString : relation lazy, éviter chargement et récursion.
    @EqualsAndHashCode.Exclude
    @ToString.Exclude
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ref_exercice_id", nullable = false)
    private RefExercice refExercice;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "archetype", nullable = false, length = 10)
    private Archetype archetype;

    @NotNull
    @Column(name = "set_number", nullable = false)
    private Integer setNumber;

    @Column(name = "rep_number", length = 20)
    private String repNumber;

    @Column(name = "weight", precision = 6, scale = 2)
    private BigDecimal weight;
}
