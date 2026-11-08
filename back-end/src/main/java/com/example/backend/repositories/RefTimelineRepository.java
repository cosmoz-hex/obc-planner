package com.example.backend.repositories;

import com.example.backend.entities.RefTimeline;
import com.example.backend.enums.Archetype;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

/**
 * Accès aux données des timelines de référence.
 *
 * <p>Lecture seule pour le moteur de génération : résolution de la séquence de
 * types de semaine d'un couple (archétype, durée), unique en base
 * (contrainte {@code uq_ref_timelines_1}).</p>
 */
public interface RefTimelineRepository extends JpaRepository<RefTimeline, Integer> {

    /** Timeline d'un archétype pour une durée de programme donnée. */
    Optional<RefTimeline> findByArchetypeAndWeeks(Archetype archetype, Integer weeks);
}
