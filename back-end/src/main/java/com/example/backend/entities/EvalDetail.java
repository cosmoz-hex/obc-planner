package com.example.backend.entities;

import com.example.backend.enums.EvalCategorie;
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
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.math.BigDecimal;

/**
 * Détail d'une mesure réalisée lors d'une évaluation, mappé sur la table
 * {@code eval_details}.
 *
 * <p>Chaque étape du wizard d'évaluation produit une ou plusieurs lignes : le
 * code de la mesure, la valeur réalisée et le résultat qualitatif (-1/0/1).
 * Les blocs psychologiques produisent une ligne par bloc dont {@code realValue}
 * porte le bitmask des affirmations cochées.</p>
 */
@Entity
@Table(name = "eval_details")
@Data
@NoArgsConstructor
public class EvalDetail {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "evaluation_detail_id")
    private Integer evaluationDetailId;

    // Exclu de equals/hashCode/toString : relation lazy, éviter chargement et récursion.
    @EqualsAndHashCode.Exclude
    @ToString.Exclude
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "evaluation_id", nullable = false)
    private EvalSummary evaluation;

    @Enumerated(EnumType.STRING)
    @Column(name = "eval_categorie", length = 10, nullable = false)
    private EvalCategorie evalCategorie;

    @Column(name = "exercice_code", length = 50)
    private String exerciceCode;

    @Column(name = "real_value", precision = 10, scale = 4)
    private BigDecimal realValue;

    @Column(name = "result")
    private Integer result;
}
