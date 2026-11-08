package com.example.backend.services.apis;

import com.example.backend.dto.ProgrammeCreateRequest;
import com.example.backend.entities.EvalSummary;
import com.example.backend.entities.Programme;

/**
 * Moteur de génération d'un programme d'entraînement (RG1..RG12).
 *
 * <p>Construit l'arbre {@link Programme} / {@code ProgrammeWeek} /
 * {@code ProgrammeTraining} en mémoire à partir d'une demande et de l'évaluation
 * source, sans le persister (la persistance est assurée par le service CRUD via
 * la cascade). La résolution s'appuie sur les tables de référence
 * ({@code ref_timelines}, {@code ref_plannings}, {@code ref_exercices}).</p>
 */
public interface ProgrammeGenerationService {

    /**
     * Génère l'arbre d'un programme (non persisté) pour une demande et une
     * évaluation données.
     *
     * @param request demande de génération (durée, fréquence, dates, objectifs)
     * @param eval    évaluation source (archétype, profils, points techniques)
     * @return le programme construit en mémoire, prêt à être persisté en cascade
     */
    Programme generate(ProgrammeCreateRequest request, EvalSummary eval);
}
