package com.example.backend.services.apis;

import com.example.backend.dto.PageResponse;
import com.example.backend.dto.ProgrammeCellUpdateRequest;
import com.example.backend.dto.ProgrammeCreateRequest;
import com.example.backend.dto.ProgrammeDetailResponse;
import com.example.backend.dto.ProgrammeResponse;
import org.springframework.data.domain.Pageable;

/** Opérations métier CRUD sur les programmes d'entraînement (la génération est déléguée au moteur dédié). */
public interface ProgrammeService {

    /**
     * Liste paginée et triée côté serveur, filtrée optionnellement par athlète
     * ({@code athleteId} {@code null} désactive le filtre).
     */
    PageResponse<ProgrammeResponse> findAll(Integer athleteId, Pageable pageable);

    /**
     * Consultation complète d'un programme (en-tête + semaines + exercices
     * planifiés) par son identifiant. Programme introuvable → 404.
     */
    ProgrammeDetailResponse findDetail(Integer programmeId);

    /**
     * Création d'un programme : charge l'évaluation source (404 si absente),
     * délègue la génération de l'arbre au moteur, puis persiste en cascade.
     */
    ProgrammeResponse create(ProgrammeCreateRequest request);

    /**
     * Actualise un programme : régénère son contenu (semaines → séances → exercices → séries)
     * avec ses paramètres d'entrée persistés, en conservant le même identifiant et le même
     * en-tête. L'évaluation source est relue à son état courant.
     *
     * <p>La génération est exécutée en mémoire <b>avant</b> toute suppression ; l'ensemble
     * est transactionnel (toute erreur laisse le programme intact). Les modifications
     * manuelles sont écrasées.</p>
     *
     * <ul>
     *   <li>Programme ou évaluation source introuvable → 404.</li>
     *   <li>Paramètres persistés hors domaine (ou objectif nul) → 400.</li>
     * </ul>
     */
    ProgrammeResponse refresh(Integer programmeId);

    /** Suppression d'un programme et de tout son arbre (semaines + exercices planifiés) en cascade. */
    void delete(Integer programmeId);

    /**
     * Remplace en bloc les exercices planifiés d'une case
     * ({@code weekNumber}, {@code trainingNumber}, {@code exerciceOrder}) :
     * suppression des lignes absentes, mise à jour des présentes, insertion des
     * nouvelles. Programme introuvable → 404.
     */
    ProgrammeDetailResponse updateCell(Integer programmeId, ProgrammeCellUpdateRequest request);
}
