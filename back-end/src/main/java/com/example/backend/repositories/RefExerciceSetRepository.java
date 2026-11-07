package com.example.backend.repositories;

import com.example.backend.entities.RefExerciceSet;
import com.example.backend.enums.Archetype;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

/**
 * Accès aux données des séries de référence.
 *
 * <p>La suppression en cascade des séries d'un exercice est assurée par
 * l'{@code orphanRemoval} de la collection {@code RefExercice.sets}. Ce repository
 * offre un accès ciblé par exercice et archétype, en complément, pour l'édition
 * inline (remplacement des séries d'un seul archétype).</p>
 */
public interface RefExerciceSetRepository extends JpaRepository<RefExerciceSet, Integer> {

    /** Séries d'un exercice pour un archétype donné. */
    List<RefExerciceSet> findByRefExerciceRefExerciceIdAndArchetype(Integer refExerciceId, Archetype archetype);
}
