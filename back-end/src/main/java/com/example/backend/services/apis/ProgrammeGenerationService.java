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
     * <p>Le drapeau {@code preferJerkForComplex} arbitre, pour les
     * <b>séries combinées « complex »</b> de l'Épaulé-Jeté (série dont
     * {@code set_number} est renseigné et {@code rep_number} est NULL), quel
     * mouvement unique émettre : {@code true} → le combiné de <b>Jeté</b> (JK),
     * {@code false} → le combiné d'<b>Épaulé</b> (CL). La décision est prise en
     * amont par le service appelant en comparant la force réalisée à l'épaulé et
     * au jeté (une absence de mesure retombe sur {@code false} → Épaulé). Les
     * séries normales (avec {@code rep_number}) restent combinées CL + JK.</p>
     *
     * @param request              demande de génération (durée, fréquence, dates, objectifs)
     * @param eval                 évaluation source (archétype, profils, points techniques)
     * @param preferJerkForComplex {@code true} pour émettre le Jeté sur les séries
     *                             complex de l'Épaulé-Jeté, {@code false} pour l'Épaulé
     * @return le programme construit en mémoire, prêt à être persisté en cascade
     */
    Programme generate(ProgrammeCreateRequest request, EvalSummary eval, boolean preferJerkForComplex);
}
