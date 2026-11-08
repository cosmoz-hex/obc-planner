package com.example.backend.services.impl;

import com.example.backend.dto.CellLineRequest;
import com.example.backend.dto.PageResponse;
import com.example.backend.dto.ProgrammeCellUpdateRequest;
import com.example.backend.dto.ProgrammeCreateRequest;
import com.example.backend.dto.ProgrammeDetailResponse;
import com.example.backend.dto.ProgrammeResponse;
import com.example.backend.entities.Athlete;
import com.example.backend.entities.EvalSummary;
import com.example.backend.entities.Programme;
import com.example.backend.entities.ProgrammeTraining;
import com.example.backend.entities.ProgrammeWeek;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.exception.ValidationException;
import com.example.backend.repositories.EvaluationRepository;
import com.example.backend.repositories.ProgrammeRepository;
import com.example.backend.services.apis.ProgrammeGenerationService;
import com.example.backend.services.apis.ProgrammeService;
import com.example.backend.services.mapper.ProgrammeMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProgrammeServiceImpl implements ProgrammeService {

    /**
     * Propriétés autorisées pour le tri côté serveur (protection contre le tri arbitraire).
     * Alignées sur les alias de la projection {@code ProgrammeRepository.findAllFiltered}.
     */
    private static final Set<String> SORTABLE_FIELDS =
            Set.of("startDate", "weeks", "frequency", "snatchGoal", "cjGoal",
                    "athleteLastName", "athleteFirstName");

    /**
     * Taille de page maximale autorisée (protection contre les requêtes trop larges).
     */
    private static final int MAX_PAGE_SIZE = 100;

    /** Valeurs fonctionnelles autorisées (garde de domaine → 400, avant toute génération). */
    private static final Set<Integer> ALLOWED_WEEKS = Set.of(8, 12, 16);
    private static final Set<Integer> ALLOWED_FREQUENCY = Set.of(3, 4, 5);
    private static final Set<Integer> ALLOWED_DURATION = Set.of(90, 120, 150);

    private final ProgrammeRepository programmeRepository;
    private final EvaluationRepository evaluationRepository;
    private final ProgrammeGenerationService programmeGenerationService;
    private final ProgrammeMapper programmeMapper;

    @Override
    @Transactional(readOnly = true)
    public PageResponse<ProgrammeResponse> findAll(Integer athleteId, Pageable pageable) {
        return PageResponse.from(programmeRepository.findAllFiltered(athleteId, sanitizeSort(pageable)));
    }

    @Override
    @Transactional(readOnly = true)
    public ProgrammeDetailResponse findDetail(Integer programmeId) {
        Programme programme = getOrThrow(programmeId);
        Athlete athlete = resolveAthlete(programme.getEvaluationId());
        return programmeMapper.toDetailResponse(programme, athlete.getFirstName(), athlete.getLastName());
    }

    @Override
    @Transactional
    public ProgrammeResponse create(ProgrammeCreateRequest request) {
        validateDomain(request);

        EvalSummary eval = evaluationRepository.findById(request.evaluationId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Évaluation introuvable : " + request.evaluationId()));

        Programme generated = programmeGenerationService.generate(request, eval);
        Programme saved = programmeRepository.save(generated);

        Athlete athlete = eval.getAthlete();
        return new ProgrammeResponse(
                saved.getProgrammeId(),
                athlete.getFirstName(),
                athlete.getLastName(),
                saved.getStartDate(),
                saved.getWeeks(),
                saved.getFrequency(),
                saved.getSnatchGoal(),
                saved.getCjGoal());
    }

    @Override
    @Transactional
    public void delete(Integer programmeId) {
        Programme programme = getOrThrow(programmeId);
        // orphanRemoval + cascade ALL suppriment les semaines et exercices planifiés.
        programmeRepository.delete(programme);
    }

    @Override
    @Transactional
    public ProgrammeDetailResponse updateCell(Integer programmeId, ProgrammeCellUpdateRequest request) {
        Programme programme = getOrThrow(programmeId);

        ProgrammeWeek week = programme.getProgrammeWeeks().stream()
                .filter(w -> Objects.equals(w.getWeekNumber(), request.weekNumber()))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Semaine introuvable : programme " + programmeId + ", semaine " + request.weekNumber()));

        replaceCellTrainings(week, request);

        Programme saved = programmeRepository.save(programme);
        Athlete athlete = resolveAthlete(saved.getEvaluationId());
        return programmeMapper.toDetailResponse(saved, athlete.getFirstName(), athlete.getLastName());
    }

    /**
     * Remplace en bloc les exercices planifiés de la case ciblée de la semaine :
     * supprime ceux dont l'identifiant n'est plus présent dans le payload
     * (orphanRemoval), met à jour les existants (par identifiant) et insère les
     * nouveaux ({@code programmeTrainingId == null}).
     */
    private void replaceCellTrainings(ProgrammeWeek week, ProgrammeCellUpdateRequest request) {
        List<CellLineRequest> lines = Optional.ofNullable(request.lines()).orElseGet(List::of);

        Set<Integer> keptIds = lines.stream()
                .map(CellLineRequest::programmeTrainingId)
                .filter(Objects::nonNull)
                .collect(Collectors.toCollection(HashSet::new));

        // Index des exercices existants de la case (par identifiant) pour la mise à jour.
        Map<Integer, ProgrammeTraining> existingById = week.getProgrammeTrainings().stream()
                .filter(t -> isSameCell(t, request))
                .filter(t -> t.getProgrammeTrainingId() != null)
                .collect(Collectors.toMap(ProgrammeTraining::getProgrammeTrainingId, Function.identity()));

        // Suppression (orphanRemoval) des exercices de la case absents du payload.
        week.getProgrammeTrainings().removeIf(
                t -> isSameCell(t, request)
                        && t.getProgrammeTrainingId() != null
                        && !keptIds.contains(t.getProgrammeTrainingId()));

        // Mise à jour des existants et insertion des nouveaux.
        for (CellLineRequest line : lines) {
            ProgrammeTraining training = Optional.ofNullable(line.programmeTrainingId())
                    .map(existingById::get)
                    .orElseGet(() -> newTraining(week, request));
            applyLine(training, line, request);
        }
    }

    /** Teste si un exercice planifié appartient à la case ({@code trainingNumber}, {@code exerciceOrder}) ciblée. */
    private boolean isSameCell(ProgrammeTraining training, ProgrammeCellUpdateRequest request) {
        return Objects.equals(training.getTrainingNumber(), request.trainingNumber())
                && Objects.equals(training.getExerciceOrder(), request.exerciceOrder());
    }

    /** Crée un nouvel exercice planifié rattaché à la semaine et à la case ciblée. */
    private ProgrammeTraining newTraining(ProgrammeWeek week, ProgrammeCellUpdateRequest request) {
        ProgrammeTraining training = new ProgrammeTraining();
        training.setProgrammeWeek(week);
        training.setTrainingNumber(request.trainingNumber());
        training.setExerciceOrder(request.exerciceOrder());
        week.getProgrammeTrainings().add(training);
        return training;
    }

    /** Applique les valeurs d'une ligne du payload à un exercice planifié (position fixée par la case). */
    private void applyLine(ProgrammeTraining training, CellLineRequest line, ProgrammeCellUpdateRequest request) {
        training.setTrainingNumber(request.trainingNumber());
        training.setExerciceOrder(request.exerciceOrder());
        training.setExerciceName(line.exerciceName());
        training.setSetNumber(line.setNumber());
        training.setRepNumber(line.repNumber());
        training.setRepLabel(line.repLabel());
        training.setMinWeight(line.minWeight());
        training.setMaxWeight(line.maxWeight());
    }

    /** Charge l'athlète via l'évaluation source du programme (le programme ne porte qu'une FK simple). */
    private Athlete resolveAthlete(Integer evaluationId) {
        return evaluationRepository.findById(evaluationId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Évaluation introuvable : " + evaluationId))
                .getAthlete();
    }

    /**
     * Garde de domaine fonctionnel (RG) appliquée avant la génération : les
     * {@code @Min/@Max} du DTO laissent passer des valeurs intermédiaires
     * (ex. weeks=10) qui échoueraient plus loin. On rejette ici en <b>400</b>
     * toute valeur hors domaine, plutôt que de laisser remonter une 409 tardive.
     */
    private void validateDomain(ProgrammeCreateRequest request) {
        if (!ALLOWED_WEEKS.contains(request.weeks())) {
            throw new ValidationException(
                    "Nombre de semaines invalide : " + request.weeks() + " (attendu : 8, 12 ou 16).");
        }
        if (!ALLOWED_FREQUENCY.contains(request.frequency())) {
            throw new ValidationException(
                    "Fréquence invalide : " + request.frequency() + " (attendu : 3, 4 ou 5).");
        }
        if (request.duration() != null && !ALLOWED_DURATION.contains(request.duration())) {
            throw new ValidationException(
                    "Durée invalide : " + request.duration() + " (attendu : 90, 120 ou 150).");
        }
    }

    private Programme getOrThrow(Integer programmeId) {
        return programmeRepository.findWithWeeksByProgrammeId(programmeId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Programme introuvable : " + programmeId));
    }

    /**
     * Nettoie le {@link Pageable} : borne la taille de page et ne conserve que les
     * tris sur des champs autorisés (sinon tri par défaut : date de début
     * décroissante).
     *
     * <p>Un {@link Pageable} non paginé (déclenché par {@code size=0} côté API) est
     * conservé tel quel — tous les résultats sont retournés — avec un tri assaini.</p>
     */
    private Pageable sanitizeSort(Pageable pageable) {
        Sort sanitized = Sort.by(pageable.getSort().stream()
                .filter(order -> SORTABLE_FIELDS.contains(order.getProperty()))
                .toList());
        if (sanitized.isUnsorted()) {
            sanitized = Sort.by(Sort.Direction.DESC, "startDate");
        }
        if (pageable.isUnpaged()) {
            return Pageable.unpaged(sanitized);
        }
        int size = Math.clamp(pageable.getPageSize(), 1, MAX_PAGE_SIZE);
        return PageRequest.of(pageable.getPageNumber(), size, sanitized);
    }
}
