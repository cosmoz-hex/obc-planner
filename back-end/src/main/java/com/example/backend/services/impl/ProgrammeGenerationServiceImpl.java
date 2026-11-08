package com.example.backend.services.impl;

import com.example.backend.dto.ProgrammeCreateRequest;
import com.example.backend.entities.EvalSummary;
import com.example.backend.entities.Programme;
import com.example.backend.entities.ProgrammeTraining;
import com.example.backend.entities.ProgrammeWeek;
import com.example.backend.entities.RefExercice;
import com.example.backend.entities.RefExerciceSet;
import com.example.backend.entities.RefPlanning;
import com.example.backend.entities.RefTimeline;
import com.example.backend.enums.Archetype;
import com.example.backend.enums.ExerciceType;
import com.example.backend.enums.ProgrammeWeekType;
import com.example.backend.enums.RefGoal;
import com.example.backend.enums.RefReference;
import com.example.backend.enums.StrengthSpeed;
import com.example.backend.enums.WeekTypeRef;
import com.example.backend.exception.BusinessRuleException;
import com.example.backend.repositories.RefExerciceRepository;
import com.example.backend.repositories.RefPlanningRepository;
import com.example.backend.repositories.RefTimelineRepository;
import com.example.backend.services.apis.ProgrammeGenerationService;
import com.example.backend.utils.MusculationQueueBuilder;
import com.example.backend.utils.MusculationQueueBuilder.MusculationQueue;
import com.example.backend.utils.ProgrammeChargeCalculator;
import com.example.backend.utils.WeekPercentCalculator;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Implémentation du moteur de génération de programme (RG1..RG12).
 *
 * <p>Suit l'algorithme séquencé du design : timeline → base_percent → cibles
 * finales → mapping des objectifs → file de musculation → semaines (résolution
 * des cases par type d'exercice). Les cibles finales sont conservées <b>non
 * arrondies</b> (calcul en une seule passe, RG10) : l'objectif de semaine stocké
 * dans {@code programme_weeks} en est un <b>round unique</b>, et la base des
 * charges d'un set en est la valeur <b>non arrondie</b> (le {@code base_percent}
 * y est déjà intégré). Aucun arrondi intermédiaire sur la cible finale.</p>
 *
 * <p>Performance : la trame {@code ref_plannings} est chargée une fois, et les
 * exercices de référence sont mis en cache local ({@code Map}) pour éviter le
 * N+1 sur les semaines.</p>
 */
@Service
@Log4j2
@RequiredArgsConstructor
public class ProgrammeGenerationServiceImpl implements ProgrammeGenerationService {

    private static final String TIMELINE_SEPARATOR = "/";

    /** Libellés fixes (sans catalogue) et marqueurs « à définir ». */
    private static final String LABEL_RENFO = "Renfo spécifique";
    private static final String LABEL_PLYO_CARDIO = "Pliométrie / Cardio";
    private static final String SUFFIX_TO_DEFINE = " (à définir)";
    private static final String LABEL_SNATCH = "Arraché";
    private static final String LABEL_CLEAN_JERK = "Épaulé-Jeté";
    private static final String LABEL_SQUAT = "Squat";
    private static final String LABEL_PULL = "Tirage";
    private static final String LABEL_MUSCULATION = "Musculation";

    private final RefTimelineRepository refTimelineRepository;
    private final RefPlanningRepository refPlanningRepository;
    private final RefExerciceRepository refExerciceRepository;
    private final WeekPercentCalculator weekPercentCalculator;
    private final ProgrammeChargeCalculator chargeCalculator;
    private final MusculationQueueBuilder musculationQueueBuilder;

    @Override
    // Aucune annotation @Transactional : la génération ne persiste rien (lecture
    // seule des référentiels). La persistance de l'arbre Programme — et donc la
    // transaction read-write — est assurée par le service CRUD appelant
    // (ProgrammeServiceImpl.create, @Transactional) via la cascade One-Many.
    public Programme generate(ProgrammeCreateRequest request, EvalSummary eval) {
        int weeks = request.weeks();
        int frequency = request.frequency();
        Archetype archetype = eval.getArchetype();

        // --- ÉTAPE 1 : timeline (RG1) ---
        List<String> timeline = resolveTimeline(archetype, weeks);

        // --- ÉTAPE 2 : base_percent par semaine (RG2) ---
        int[] basePercent = computeBasePercents(weeks);

        // --- ÉTAPE 3 : cibles finales par mouvement (RG3), non arrondies ---
        Map<RefReference, Double> finalGoals =
                chargeCalculator.finalGoals(request.snatchGoal(), request.cjGoal());

        // --- ÉTAPE 4 : mapping des objectifs depuis l'évaluation (RG5) ---
        RefGoal goalSN = techniqueGoal(eval.getSnatch());
        RefGoal goalCL = techniqueGoal(eval.getClean());
        RefGoal goalJK = techniqueGoal(eval.getJerk());
        RefGoal goalSQ = strengthSpeedGoal(eval.getSquat());
        RefGoal goalPL = strengthSpeedGoal(eval.getPull());

        // --- ÉTAPE 5 : file de musculation (RG9), construite une seule fois ---
        MusculationQueue musculationQueue = musculationQueueBuilder.build(eval.getMusculation());

        // Trame de séances chargée une fois ; cache local des exercices de référence.
        List<RefPlanning> planning =
                refPlanningRepository.findByWeeksNumbersOrderByTrainingOrderAscExerciceOrderAsc(frequency);
        Map<ExerciceCacheKey, List<RefExercice>> exerciceCache = new HashMap<>();

        Programme programme = buildProgramme(request, weeks);

        // --- ÉTAPE 6 : semaines ---
        for (int weekNumber = 1; weekNumber <= weeks; weekNumber++) {
            ProgrammeWeekType weekType = ProgrammeWeekType.valueOf(timeline.get(weekNumber - 1));
            int bp = basePercent[weekNumber];

            ProgrammeWeek week = buildWeek(programme, weekNumber, weekType, bp, finalGoals);

            if (weekType == ProgrammeWeekType.PC) {
                // Semaine de pré-compétition : toutes les cases « à définir ».
                planning.forEach(row -> addPlaceholder(week, row, toDefineLabel(row.getExerciceType())));
                continue;
            }

            WeekTypeRef weekTypeRef = WeekTypeRef.valueOf(weekType.name());
            Map<ExerciceType, Integer> counters = new HashMap<>();

            for (RefPlanning row : planning) {
                resolveCase(week, row, weekTypeRef, bp, finalGoals, archetype, counters,
                        goalSN, goalCL, goalJK, goalSQ, goalPL, musculationQueue, exerciceCache);
            }
        }
        return programme;
    }

    /** Résout une case du planning selon le type d'exercice attendu. */
    private void resolveCase(ProgrammeWeek week, RefPlanning row, WeekTypeRef weekTypeRef, int basePercent,
                             Map<RefReference, Double> finalGoals, Archetype archetype,
                             Map<ExerciceType, Integer> counters,
                             RefGoal goalSN, RefGoal goalCL, RefGoal goalJK, RefGoal goalSQ, RefGoal goalPL,
                             MusculationQueue musculationQueue,
                             Map<ExerciceCacheKey, List<RefExercice>> cache) {
        ExerciceType type = row.getExerciceType();
        switch (type) {
            case SN -> resolveSimple(week, row, weekTypeRef, basePercent, finalGoals, archetype,
                    counters, ExerciceType.SN, goalSN, LABEL_SNATCH, cache);
            case SQ -> resolveSimple(week, row, weekTypeRef, basePercent, finalGoals, archetype,
                    counters, ExerciceType.SQ, goalSQ, LABEL_SQUAT, cache);
            case PL -> resolveSimple(week, row, weekTypeRef, basePercent, finalGoals, archetype,
                    counters, ExerciceType.PL, goalPL, LABEL_PULL, cache);
            case CJ -> resolveCleanJerk(week, row, weekTypeRef, basePercent, finalGoals, archetype,
                    counters, goalCL, goalJK, cache);
            case MS -> resolveMusculation(week, row, archetype, musculationQueue);
            case RF -> addFixedLabel(week, row, LABEL_RENFO);
            case PC -> addFixedLabel(week, row, LABEL_PLYO_CARDIO);
            default -> addPlaceholder(week, row, toDefineLabel(type));
        }
    }

    /** Cases Arraché / Squat / Tirage : un seul mouvement, compteur d'ordre dédié. */
    private void resolveSimple(ProgrammeWeek week, RefPlanning row, WeekTypeRef weekTypeRef, int basePercent,
                               Map<RefReference, Double> finalGoals, Archetype archetype,
                               Map<ExerciceType, Integer> counters, ExerciceType type, RefGoal goal,
                               String movementLabel, Map<ExerciceCacheKey, List<RefExercice>> cache) {
        int order = increment(counters, type);
        if (goal == null) {
            addPlaceholder(week, row, movementLabel + SUFFIX_TO_DEFINE);
            return;
        }
        List<RefExercice> exercices = findExercices(cache, type, weekTypeRef, goal, order);
        if (exercices.isEmpty()) {
            addPlaceholder(week, row, movementLabel + SUFFIX_TO_DEFINE);
            return;
        }
        exercices.forEach(ex -> emitTrainings(week, row, ex, basePercent, finalGoals, archetype));
    }

    /** Case Épaulé-Jeté (RG8) : appariement des mouvements CL et JK par index. */
    private void resolveCleanJerk(ProgrammeWeek week, RefPlanning row, WeekTypeRef weekTypeRef, int basePercent,
                                  Map<RefReference, Double> finalGoals, Archetype archetype,
                                  Map<ExerciceType, Integer> counters, RefGoal goalCL, RefGoal goalJK,
                                  Map<ExerciceCacheKey, List<RefExercice>> cache) {
        int order = increment(counters, ExerciceType.CJ);
        if (goalCL == null || goalJK == null) {
            addPlaceholder(week, row, LABEL_CLEAN_JERK + SUFFIX_TO_DEFINE);
            return;
        }
        List<RefExercice> cleans = findExercices(cache, ExerciceType.CL, weekTypeRef, goalCL, order);
        List<RefExercice> jerks = findExercices(cache, ExerciceType.JK, weekTypeRef, goalJK, order);
        if (cleans.isEmpty() || jerks.isEmpty()) {
            addPlaceholder(week, row, LABEL_CLEAN_JERK + SUFFIX_TO_DEFINE);
            return;
        }
        int pairs = Math.min(cleans.size(), jerks.size());
        for (int i = 0; i < pairs; i++) {
            emitCombined(week, row, cleans.get(i), jerks.get(i), basePercent, finalGoals, archetype);
        }
    }

    /** Case Musculation (RG9) : pioche rotative dans la file, volume sans charge. */
    private void resolveMusculation(ProgrammeWeek week, RefPlanning row, Archetype archetype,
                                    MusculationQueue musculationQueue) {
        RefExercice exercice = musculationQueue.rotate();
        if (exercice == null) {
            addPlaceholder(week, row, LABEL_MUSCULATION + SUFFIX_TO_DEFINE);
            return;
        }
        // Volume only : pas de charge (finalGoals ignorés via charge=false).
        emitTrainings(week, row, exercice, 0, null, archetype);
    }

    /**
     * Émet un {@link ProgrammeTraining} par série de l'exercice (RG11) pour
     * l'archétype de l'évaluation. Calcule les charges si une référence et un
     * poids sont présents et que la charge est demandée ({@code finalGoals} non
     * null).
     */
    private void emitTrainings(ProgrammeWeek week, RefPlanning row, RefExercice exercice, int basePercent,
                               Map<RefReference, Double> finalGoals, Archetype archetype) {
        List<RefExerciceSet> sets = setsForArchetype(exercice, archetype);
        for (RefExerciceSet set : sets) {
            ProgrammeTraining training = baseTraining(week, row, exercice.getExerciceName());
            training.setSetNumber(set.getSetNumber());
            training.setRepNumber(set.getRepNumber());
            training.setRepLabel(null);
            applyCharge(training, finalGoals, exercice.getReference(), set.getWeight(), basePercent);
            week.getProgrammeTrainings().add(training);
        }
    }

    /**
     * Émet les lignes combinées Épaulé + Jeté (RG8 révisé) : le CJ peut être
     * <b>multi-séries</b>, comme l'Arraché. On boucle sur les séries de l'Épaulé
     * (CL prévaut) et on apparie, par index, la série du Jeté correspondante.
     *
     * <p>Les séries CL et JK sont normalement identiques en base. Si leurs
     * nombres diffèrent, l'Épaulé fait foi : une ligne est émise par série CL ;
     * la série JK absente ({@code i >= jerkSets.size()}) est traitée comme nulle.
     * Chaque ligne produit un {@link ProgrammeTraining} (même {@code exerciceOrder}
     * / {@code trainingNumber} que la case). Le nombre de séries et la charge
     * proviennent de la série CL courante (référence Épaulé-Jeté = CJ) ; le label
     * associe les répétitions des deux mouvements, {@code repNumber} reste nul.</p>
     */
    private void emitCombined(ProgrammeWeek week, RefPlanning row, RefExercice clean, RefExercice jerk,
                              int basePercent, Map<RefReference, Double> finalGoals, Archetype archetype) {
        List<RefExerciceSet> cleanSets = setsForArchetype(clean, archetype);
        List<RefExerciceSet> jerkSets = setsForArchetype(jerk, archetype);
        if (cleanSets.isEmpty() || jerkSets.isEmpty()) {
            addPlaceholder(week, row, LABEL_CLEAN_JERK + SUFFIX_TO_DEFINE);
            return;
        }
        String combinedName = clean.getExerciceName() + " + " + jerk.getExerciceName();
        for (int i = 0; i < cleanSets.size(); i++) {
            RefExerciceSet cleanSet = cleanSets.get(i);
            RefExerciceSet jerkSet = i < jerkSets.size() ? jerkSets.get(i) : null;
            String repsCL = cleanSet.getRepNumber();
            String repsJK = jerkSet == null ? null : jerkSet.getRepNumber();

            ProgrammeTraining training = baseTraining(week, row, combinedName);
            training.setSetNumber(cleanSet.getSetNumber());
            training.setRepNumber(null);
            training.setRepLabel(combinedRepLabel(repsCL, repsJK));
            // Charge sur la série de l'Épaulé courante, référence Épaulé-Jeté (CJ).
            applyCharge(training, finalGoals, clean.getReference(), cleanSet.getWeight(), basePercent);
            week.getProgrammeTrainings().add(training);
        }
    }

    /**
     * Label de répétitions d'une ligne combinée (RG8).
     *
     * <ul>
     *   <li>CL et JK nuls → {@code null} (aucun label).</li>
     *   <li>reps égales (cas nominal) → {@code "reps (1 + 1)"}.</li>
     *   <li>sinon → {@code "(repsCL + repsJK)"}, chaque reps absent remplacé par
     *       une chaîne vide.</li>
     * </ul>
     */
    private String combinedRepLabel(String repsCL, String repsJK) {
        if (repsCL == null && repsJK == null) {
            return null;
        }
        if (repsCL != null && repsCL.equals(repsJK)) {
            return repsCL + " (1 + 1)";
        }
        return "(" + nullToEmpty(repsCL) + " + " + nullToEmpty(repsJK) + ")";
    }

    /** Remplace une valeur nulle par une chaîne vide (label combiné). */
    private String nullToEmpty(String value) {
        return value == null ? "" : value;
    }

    /** Applique les charges min/max si référence + poids présents et charge demandée. */
    private void applyCharge(ProgrammeTraining training, Map<RefReference, Double> finalGoals,
                             RefReference reference, BigDecimal weight, int basePercent) {
        if (finalGoals == null || reference == null || weight == null) {
            return;
        }
        Double finalGoal = finalGoals.get(reference);
        if (finalGoal == null) {
            return;
        }
        double weekBase = chargeCalculator.weekBase(finalGoal, basePercent);
        training.setMinWeight(chargeCalculator.minWeight(weekBase, weight));
        training.setMaxWeight(chargeCalculator.maxWeight(weekBase, weight));
    }

    /** Ajoute une case « à définir » (sans série ni charge). */
    private void addPlaceholder(ProgrammeWeek week, RefPlanning row, String label) {
        week.getProgrammeTrainings().add(baseTraining(week, row, label));
    }

    /** Ajoute une case à libellé fixe (RF / PC, sans série ni charge). */
    private void addFixedLabel(ProgrammeWeek week, RefPlanning row, String label) {
        week.getProgrammeTrainings().add(baseTraining(week, row, label));
    }

    /** Crée un {@link ProgrammeTraining} rattaché à la semaine, sans série ni charge. */
    private ProgrammeTraining baseTraining(ProgrammeWeek week, RefPlanning row, String name) {
        ProgrammeTraining training = new ProgrammeTraining();
        training.setProgrammeWeek(week);
        training.setTrainingNumber(row.getTrainingOrder());
        training.setExerciceOrder(row.getExerciceOrder());
        training.setExerciceName(name);
        return training;
    }

    private Programme buildProgramme(ProgrammeCreateRequest request, int weeks) {
        Programme programme = new Programme();
        programme.setEvaluationId(request.evaluationId());
        programme.setWeeks(weeks);
        programme.setFrequency(request.frequency());
        programme.setDuration(request.duration());
        programme.setStartDate(request.startDate());
        programme.setEndDate(request.startDate().plusWeeks(weeks).minusDays(1));
        programme.setSnatchGoal(request.snatchGoal());
        programme.setCjGoal(request.cjGoal());
        return programme;
    }

    private ProgrammeWeek buildWeek(Programme programme, int weekNumber, ProgrammeWeekType weekType,
                                    int basePercent, Map<RefReference, Double> finalGoals) {
        ProgrammeWeek week = new ProgrammeWeek();
        week.setProgramme(programme);
        week.setWeekNumber(weekNumber);
        LocalDate weekStart = programme.getStartDate().plusWeeks(weekNumber - 1L);
        week.setStartDate(weekStart);
        week.setEndDate(weekStart.plusDays(6));
        week.setWeekType(weekType);
        week.setBasePercent(BigDecimal.valueOf(basePercent));
        week.setSnatchGoal(chargeCalculator.weekGoal(finalGoals.get(RefReference.SN), basePercent));
        week.setCjGoal(chargeCalculator.weekGoal(finalGoals.get(RefReference.CJ), basePercent));
        week.setBackSquatGoal(chargeCalculator.weekGoal(finalGoals.get(RefReference.BS), basePercent));
        week.setFrontSquatGoal(chargeCalculator.weekGoal(finalGoals.get(RefReference.FS), basePercent));
        week.setSnatchPullGoal(chargeCalculator.weekGoal(finalGoals.get(RefReference.SP), basePercent));
        week.setCjPullGoal(chargeCalculator.weekGoal(finalGoals.get(RefReference.CP), basePercent));
        programme.getProgrammeWeeks().add(week);
        return week;
    }

    /** Timeline (RG1) : séquence de types de semaine ; absente → règle métier (409). */
    private List<String> resolveTimeline(Archetype archetype, int weeks) {
        RefTimeline timeline = refTimelineRepository.findByArchetypeAndWeeks(archetype, weeks)
                .orElseThrow(() -> new BusinessRuleException(
                        "Timeline de référence introuvable pour l'archétype " + archetype
                                + " et " + weeks + " semaines."));
        List<String> parts = List.of(timeline.getTimeline().split(TIMELINE_SEPARATOR));
        if (parts.size() != weeks) {
            throw new BusinessRuleException(
                    "Timeline incohérente (" + parts.size() + " semaines) pour " + weeks + " semaines attendues.");
        }
        return parts;
    }

    /** base_percent[1..weeks] ; indice 0 inutilisé ; semaine PC (dernière) = 100. */
    private int[] computeBasePercents(int weeks) {
        int usefulWeeks = weeks - 1;
        int[] basePercent = new int[weeks + 1];
        for (int i = 1; i <= usefulWeeks; i++) {
            basePercent[i] = weekPercentCalculator.basePercent(i, usefulWeeks);
        }
        basePercent[weeks] = WeekPercentCalculator.PRE_COMPETITION_PERCENT;
        return basePercent;
    }

    /** Objectif technique depuis la chaîne de l'évaluation (EXT|CATCH|PATH), null si absent. */
    private RefGoal techniqueGoal(String value) {
        return value == null || value.isBlank() ? null : RefGoal.valueOf(value);
    }

    /** Mapping profil force-vitesse → objectif squat/tirage (STRENGTH→STR, SPEED→SPD, MID|null→KEEP). */
    private RefGoal strengthSpeedGoal(StrengthSpeed strengthSpeed) {
        if (strengthSpeed == StrengthSpeed.STRENGTH) {
            return RefGoal.STR;
        }
        if (strengthSpeed == StrengthSpeed.SPEED) {
            return RefGoal.SPD;
        }
        return RefGoal.KEEP;
    }

    /** Libellé « à définir » par type de case. */
    private String toDefineLabel(ExerciceType type) {
        String movement = switch (type) {
            case SN -> LABEL_SNATCH;
            case CJ, CL, JK -> LABEL_CLEAN_JERK;
            case SQ -> LABEL_SQUAT;
            case PL -> LABEL_PULL;
            case RF -> LABEL_RENFO;
            case PC -> LABEL_PLYO_CARDIO;
            case MS -> LABEL_MUSCULATION;
        };
        return movement + SUFFIX_TO_DEFINE;
    }

    private int increment(Map<ExerciceType, Integer> counters, ExerciceType type) {
        return counters.merge(type, 1, Integer::sum);
    }

    /**
     * Séries d'un exercice pour un archétype donné, triées par identifiant
     * croissant. Le tri garantit un ordre stable (ordre d'insertion) pour
     * l'appariement par index des mouvements combinés (Épaulé/Jeté) et pour
     * l'affichage des séries simples.
     */
    private List<RefExerciceSet> setsForArchetype(RefExercice exercice, Archetype archetype) {
        return exercice.getSets().stream()
                .filter(set -> set.getArchetype() == archetype)
                .sorted(Comparator.comparing(RefExerciceSet::getRefExerciceSetId))
                .toList();
    }

    /** Recherche d'exercices de référence avec cache local (évite le N+1 sur les semaines). */
    private List<RefExercice> findExercices(Map<ExerciceCacheKey, List<RefExercice>> cache,
                                            ExerciceType type, WeekTypeRef weekType, RefGoal goal, int order) {
        return cache.computeIfAbsent(
                new ExerciceCacheKey(type, weekType, goal, order),
                key -> refExerciceRepository.findByExerciceTypeAndWeekTypeAndGoalAndTrainingOrder(
                        key.type(), key.weekType(), key.goal(), key.order()));
    }

    /** Clé de cache des exercices de référence par case de génération. */
    private record ExerciceCacheKey(ExerciceType type, WeekTypeRef weekType, RefGoal goal, Integer order) {
    }
}
