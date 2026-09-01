package com.example.backend.enums;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

/**
 * Catégorie de poids (kg), alignée sur la contrainte {@code chk_athletes_3}.
 * <p>
 * En base, la colonne {@code weight_categorie} est un {@code INTEGER} : cet enum
 * porte la valeur numérique ({@link #getValue()}) et le sexe associé, afin de
 * centraliser la règle métier « listes de poids distinctes selon le sexe ».
 * La valeur {@code 999} représente la catégorie « supérieur » (open) pour chaque sexe.
 */
public enum WeightCategorie {

    // Femmes
    F_41(41, Sexe.F),
    F_45(45, Sexe.F),
    F_49(49, Sexe.F),
    F_53(53, Sexe.F),
    F_57(57, Sexe.F),
    F_61(61, Sexe.F),
    F_69(69, Sexe.F),
    F_77(77, Sexe.F),
    F_86(86, Sexe.F),
    F_OPEN(999, Sexe.F),

    // Hommes
    M_51(51, Sexe.M),
    M_55(55, Sexe.M),
    M_60(60, Sexe.M),
    M_65(65, Sexe.M),
    M_70(70, Sexe.M),
    M_75(75, Sexe.M),
    M_85(85, Sexe.M),
    M_95(95, Sexe.M),
    M_110(110, Sexe.M),
    M_OPEN(999, Sexe.M);

    private final int value;
    private final Sexe sexe;

    WeightCategorie(int value, Sexe sexe) {
        this.value = value;
        this.sexe = sexe;
    }

    public int getValue() {
        return value;
    }

    public Sexe getSexe() {
        return sexe;
    }

    /** Liste des catégories de poids valides pour un sexe donné. */
    public static List<WeightCategorie> forSexe(Sexe sexe) {
        return Arrays.stream(values())
                .filter(weightCategorie -> weightCategorie.sexe == sexe)
                .toList();
    }

    /** Retrouve la catégorie de poids correspondant à une valeur et un sexe. */
    public static Optional<WeightCategorie> of(Integer value, Sexe sexe) {
        if (value == null || sexe == null) {
            return Optional.empty();
        }
        return Arrays.stream(values())
                .filter(weightCategorie -> weightCategorie.sexe == sexe && weightCategorie.value == value)
                .findFirst();
    }
}
