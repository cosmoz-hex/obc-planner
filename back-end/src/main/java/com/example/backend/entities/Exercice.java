package com.example.backend.entities;

import com.example.backend.enums.CategorieExercice;
import com.example.backend.enums.TypeExercice;
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
 * Exercice de référence du catalogue, mappé sur la table {@code exercices}.
 *
 * <p>Un exercice peut référencer un exercice parent ({@code exercice_ref}) dont
 * il dérive : {@code estimateValue} exprime alors la charge théorique en
 * pourcentage de cet exercice de référence.</p>
 */
@Entity
@Table(name = "exercices")
@Data
@NoArgsConstructor
public class Exercice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "exercice_id")
    private Integer exerciceId;

    // Exclu de equals/hashCode/toString : relation lazy auto-référente, éviter chargement et récursion.
    @EqualsAndHashCode.Exclude
    @ToString.Exclude
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "exercice_ref")
    private Exercice exerciceRef;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "type_exercice", nullable = false, length = 10)
    private TypeExercice typeExercice;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "categorie_exercice", nullable = false, length = 10)
    private CategorieExercice categorieExercice;

    @NotNull
    @Column(name = "exercice_code", nullable = false, length = 50)
    private String exerciceCode;

    @Column(name = "estimate_value", precision = 4, scale = 2)
    private BigDecimal estimateValue;
}
