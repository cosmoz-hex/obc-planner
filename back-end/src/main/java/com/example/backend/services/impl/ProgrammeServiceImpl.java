package com.example.backend.services.impl;

import com.example.backend.dto.CellExerciceRequest;
import com.example.backend.dto.CellSeriesRequest;
import com.example.backend.dto.PageResponse;
import com.example.backend.dto.ProgrammeCellUpdateRequest;
import com.example.backend.dto.ProgrammeCreateRequest;
import com.example.backend.dto.ProgrammeDetailResponse;
import com.example.backend.dto.ProgrammeResponse;
import com.example.backend.entities.Athlete;
import com.example.backend.entities.EvalSummary;
import com.example.backend.entities.Programme;
import com.example.backend.entities.ProgrammeExercice;
import com.example.backend.entities.ProgrammeSeries;
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
        // orphanRemoval + cascade ALL suppriment semaines, séances, exercices et séries.
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

        ProgrammeTraining training = resolveOrCreateTraining(week, request.trainingNumber());
        replaceCellExercices(training, request);

        Programme saved = programmeRepository.save(programme);
        Athlete athlete = resolveAthlete(saved.getEvaluationId());
        return programmeMapper.toDetailResponse(saved, athlete.getFirstName(), athlete.getLastName());
    }

    /**
     * Récupère la séance ({@code trainingNumber}) de la semaine ou la crée si elle
     * n'existe pas encore (cas limite — toutes les séances existent via le moteur).
     */
    private ProgrammeTraining resolveOrCreateTraining(ProgrammeWeek week, Integer trainingNumber) {
        return week.getProgrammeTrainings().stream()
                .filter(t -> Objects.equals(t.getTrainingNumber(), trainingNumber))
                .findFirst()
                .orElseGet(() -> {
                    ProgrammeTraining training = new ProgrammeTraining();
                    training.setProgrammeWeek(week);
                    training.setTrainingNumber(trainingNumber);
                    week.getProgrammeTrainings().add(training);
                    return training;
                });
    }

    /**
     * Remplace en bloc les exercices de la case ciblée ({@code exerciceOrder}) de la
     * séance : supprime ceux dont l'identifiant n'est plus présent dans le payload
     * (orphanRemoval), met à jour les existants (nom + séries, par identifiant) et
     * insère les nouveaux ({@code programmeExerciceId == null}).
     */
    private void replaceCellExercices(ProgrammeTraining training, ProgrammeCellUpdateRequest request) {
        List<CellExerciceRequest> exercices = Optional.ofNullable(request.exercices()).orElseGet(List::of);

        Set<Integer> keptIds = exercices.stream()
                .map(CellExerciceRequest::programmeExerciceId)
                .filter(Objects::nonNull)
                .collect(Collectors.toCollection(HashSet::new));

        // Index des exercices existants de la case (par identifiant) pour la mise à jour.
        Map<Integer, ProgrammeExercice> existingById = training.getProgrammeExercices().stream()
                .filter(e -> Objects.equals(e.getExerciceOrder(), request.exerciceOrder()))
                .filter(e -> e.getProgrammeExerciceId() != null)
                .collect(Collectors.toMap(ProgrammeExercice::getProgrammeExerciceId, Function.identity()));

        // Suppression (orphanRemoval) des exercices de la case absents du payload.
        training.getProgrammeExercices().removeIf(
                e -> Objects.equals(e.getExerciceOrder(), request.exerciceOrder())
                        && e.getProgrammeExerciceId() != null
                        && !keptIds.contains(e.getProgrammeExerciceId()));

        // Mise à jour des existants et insertion des nouveaux.
        for (CellExerciceRequest exerciceRequest : exercices) {
            ProgrammeExercice exercice = Optional.ofNullable(exerciceRequest.programmeExerciceId())
                    .map(existingById::get)
                    .orElseGet(() -> newExercice(training, request.exerciceOrder()));
            exercice.setExerciceOrder(request.exerciceOrder());
            exercice.setExerciceName(exerciceRequest.exerciceName());
            replaceExerciceSeries(exercice, exerciceRequest);
        }
    }

    /** Crée un nouvel exercice rattaché à la séance à la position ({@code exerciceOrder}) ciblée. */
    private ProgrammeExercice newExercice(ProgrammeTraining training, Integer exerciceOrder) {
        ProgrammeExercice exercice = new ProgrammeExercice();
        exercice.setProgrammeTraining(training);
        exercice.setExerciceOrder(exerciceOrder);
        training.getProgrammeExercices().add(exercice);
        return exercice;
    }

    /**
     * Remplace en bloc les séries d'un exercice : supprime celles absentes du
     * payload (orphanRemoval), met à jour les existantes (par identifiant) et insère
     * les nouvelles ({@code programmeSeriesId == null}).
     */
    private void replaceExerciceSeries(ProgrammeExercice exercice, CellExerciceRequest exerciceRequest) {
        List<CellSeriesRequest> seriesRequests = Optional.ofNullable(exerciceRequest.series()).orElseGet(List::of);

        Set<Integer> keptIds = seriesRequests.stream()
                .map(CellSeriesRequest::programmeSeriesId)
                .filter(Objects::nonNull)
                .collect(Collectors.toCollection(HashSet::new));

        Map<Integer, ProgrammeSeries> existingById = exercice.getProgrammeSeries().stream()
                .filter(s -> s.getProgrammeSeriesId() != null)
                .collect(Collectors.toMap(ProgrammeSeries::getProgrammeSeriesId, Function.identity()));

        exercice.getProgrammeSeries().removeIf(
                s -> s.getProgrammeSeriesId() != null && !keptIds.contains(s.getProgrammeSeriesId()));

        for (CellSeriesRequest seriesRequest : seriesRequests) {
            ProgrammeSeries series = Optional.ofNullable(seriesRequest.programmeSeriesId())
                    .map(existingById::get)
                    .orElseGet(() -> newSeries(exercice));
            series.setSetNumber(seriesRequest.setNumber());
            series.setRepNumber(seriesRequest.repNumber());
            series.setMinWeight(seriesRequest.minWeight());
            series.setMaxWeight(seriesRequest.maxWeight());
        }
    }

    /** Crée une nouvelle série rattachée à l'exercice. */
    private ProgrammeSeries newSeries(ProgrammeExercice exercice) {
        ProgrammeSeries series = new ProgrammeSeries();
        series.setProgrammeExercice(exercice);
        exercice.getProgrammeSeries().add(series);
        return series;
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
