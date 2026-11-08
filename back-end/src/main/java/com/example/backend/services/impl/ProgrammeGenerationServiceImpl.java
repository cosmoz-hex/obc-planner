package com.example.backend.services.impl;

import com.example.backend.dto.ProgrammeCreateRequest;
import com.example.backend.entities.*;
import com.example.backend.enums.*;
import com.example.backend.exception.BusinessRuleException;
import com.example.backend.repositories.RefExerciceRepository;
import com.example.backend.repositories.RefPlanningRepository;
import com.example.backend.repositories.RefTimelineRepository;
import com.example.backend.services.apis.ProgrammeGenerationService;
import com.example.backend.utils.MusculationQueueBuilder;
import com.example.backend.utils.ProgrammeChargeCalculator;
import com.example.backend.utils.WeekPercentCalculator;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;

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

    /**
     * Libellés fixes (sans catalogue) et marqueurs « à définir ».
     */
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

        // --- ÉTAPE 5 : objectifs de musculation (RG9), calculés une seule fois ---
        List<RefGoal> musculationGoals = musculationQueueBuilder.bitmaskToGoals(eval.getMusculation());

        // File rotative GLOBALE de groupes de musculation, construite UNE SEULE FOIS
        // avant la boucle des semaines : chaque élément est un groupe d'exercices
        // alternatifs (« ou ») correspondant à un (goal, trainingOrder). Le curseur
        // rotatif est partagé pour toute la génération (pas de reset inter-semaines).
        Deque<List<RefExercice>> musculationGroups = buildMusculationGroups(musculationGoals);

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

            // Séances de la semaine, indexées par numéro de séance (créées à la demande).
            Map<Integer, ProgrammeTraining> trainings = new HashMap<>();

            if (weekType == ProgrammeWeekType.PC) {
                // Semaine de pré-compétition : toutes les cases « à définir ».
                planning.forEach(row -> addPlaceholder(week, trainings, row, toDefineLabel(row.getExerciceType())));
                continue;
            }

            WeekTypeRef weekTypeRef = WeekTypeRef.valueOf(weekType.name());
            Map<ExerciceType, Integer> counters = new HashMap<>();

            for (RefPlanning row : planning) {
                resolveCase(week, trainings, row, weekTypeRef, bp, finalGoals, archetype, counters,
                        goalSN, goalCL, goalJK, goalSQ, goalPL, musculationGroups, exerciceCache);
            }
        }
        return programme;
    }

    /**
     * Résout une case du planning selon le type d'exercice attendu.
     */
    private void resolveCase(ProgrammeWeek week, Map<Integer, ProgrammeTraining> trainings, RefPlanning row,
                             WeekTypeRef weekTypeRef, int basePercent,
                             Map<RefReference, Double> finalGoals, Archetype archetype,
                             Map<ExerciceType, Integer> counters,
                             RefGoal goalSN, RefGoal goalCL, RefGoal goalJK, RefGoal goalSQ, RefGoal goalPL,
                             Deque<List<RefExercice>> musculationGroups,
                             Map<ExerciceCacheKey, List<RefExercice>> cache) {
        ExerciceType type = row.getExerciceType();
        switch (type) {
            case SN -> resolveSimple(week, trainings, row, weekTypeRef, basePercent, finalGoals, archetype,
                    counters, ExerciceType.SN, goalSN, LABEL_SNATCH, cache);
            case SQ -> resolveSimple(week, trainings, row, weekTypeRef, basePercent, finalGoals, archetype,
                    counters, ExerciceType.SQ, goalSQ, LABEL_SQUAT, cache);
            case PL -> resolveSimple(week, trainings, row, weekTypeRef, basePercent, finalGoals, archetype,
                    counters, ExerciceType.PL, goalPL, LABEL_PULL, cache);
            case CJ -> resolveCleanJerk(week, trainings, row, weekTypeRef, basePercent, finalGoals, archetype,
                    counters, goalCL, goalJK, cache);
            case MS -> resolveMusculation(week, trainings, row, archetype, musculationGroups);
            case RF -> addFixedLabel(week, trainings, row, LABEL_RENFO);
            case PC -> addFixedLabel(week, trainings, row, LABEL_PLYO_CARDIO);
            default -> addPlaceholder(week, trainings, row, toDefineLabel(type));
        }
    }

    /**
     * Cases Arraché / Squat / Tirage : un seul mouvement, compteur d'ordre dédié.
     */
    private void resolveSimple(ProgrammeWeek week, Map<Integer, ProgrammeTraining> trainings, RefPlanning row,
                               WeekTypeRef weekTypeRef, int basePercent,
                               Map<RefReference, Double> finalGoals, Archetype archetype,
                               Map<ExerciceType, Integer> counters, ExerciceType type, RefGoal goal,
                               String movementLabel, Map<ExerciceCacheKey, List<RefExercice>> cache) {
        int order = increment(counters, type);
        if (goal == null) {
            addPlaceholder(week, trainings, row, movementLabel + SUFFIX_TO_DEFINE);
            return;
        }
        List<RefExercice> exercices = findExercices(cache, type, weekTypeRef, goal, order);
        if (exercices.isEmpty()) {
            addPlaceholder(week, trainings, row, movementLabel + SUFFIX_TO_DEFINE);
            return;
        }
        exercices.forEach(ex -> emitExercice(week, trainings, row, ex, basePercent, finalGoals, archetype));
    }

    /**
     * Case Épaulé-Jeté (RG8) : appariement des mouvements CL et JK par index.
     */
    private void resolveCleanJerk(ProgrammeWeek week, Map<Integer, ProgrammeTraining> trainings, RefPlanning row,
                                  WeekTypeRef weekTypeRef, int basePercent,
                                  Map<RefReference, Double> finalGoals, Archetype archetype,
                                  Map<ExerciceType, Integer> counters, RefGoal goalCL, RefGoal goalJK,
                                  Map<ExerciceCacheKey, List<RefExercice>> cache) {
        int order = increment(counters, ExerciceType.CJ);
        if (goalCL == null || goalJK == null) {
            addPlaceholder(week, trainings, row, LABEL_CLEAN_JERK + SUFFIX_TO_DEFINE);
            return;
        }
        List<RefExercice> cleans = findExercices(cache, ExerciceType.CL, weekTypeRef, goalCL, order);
        List<RefExercice> jerks = findExercices(cache, ExerciceType.JK, weekTypeRef, goalJK, order);
        if (cleans.isEmpty() || jerks.isEmpty()) {
            addPlaceholder(week, trainings, row, LABEL_CLEAN_JERK + SUFFIX_TO_DEFINE);
            return;
        }
        int pairs = Math.min(cleans.size(), jerks.size());
        for (int i = 0; i < pairs; i++) {
            emitCombined(week, trainings, row, cleans.get(i), jerks.get(i), basePercent, finalGoals, archetype);
        }
    }

    /**
     * Case Musculation (RG9 / RG5) : pioche <b>un seul groupe</b> d'exercices
     * alternatifs (« au choix ») dans la file rotative GLOBALE de groupes, construite
     * une fois pour toute la génération par {@link #buildMusculationGroups}. Le
     * curseur avance à chaque case MS (rotation tête → queue) et ne se réinitialise
     * <b>jamais</b> entre les cases ni entre les semaines : la séquence de groupes est
     * consommée de façon continue (puis boucle). Chaque {@link RefExercice} du groupe
     * produit un {@link ProgrammeExercice} (volume sans charge) au même
     * {@code exerciceOrder} que la case → affichage « ex. 1 ou ex. 2 ». File vide
     * (aucune orientation n'a d'exercice MS/F) → case « à définir ».
     */
    private void resolveMusculation(ProgrammeWeek week, Map<Integer, ProgrammeTraining> trainings, RefPlanning row,
                                    Archetype archetype, Deque<List<RefExercice>> musculationGroups) {
        if (musculationGroups.isEmpty()) {
            addPlaceholder(week, trainings, row, LABEL_MUSCULATION + SUFFIX_TO_DEFINE);
            return;
        }
        // Rotation : pioche le groupe en tête et le replace en fin de file (curseur global).
        List<RefExercice> group = musculationGroups.poll();
        musculationGroups.offer(group);
        // Chaque exercice du groupe = une alternative « ou », volume sans charge (finalGoals null).
        group.forEach(exercice -> emitExercice(week, trainings, row, exercice, 0, null, archetype));
    }

    /**
     * Construit la file rotative GLOBALE de groupes de musculation (RG9 / RG5),
     * <b>une seule fois</b> avant la génération des semaines. Un <b>groupe</b> =
     * l'ensemble des exercices de référence {@code MS}/{@link WeekTypeRef#F} d'une
     * orientation ({@code goal}) à un même {@code trainingOrder} (= alternatives « au
     * choix »). La musculation n'étant peuplée qu'en semaine {@code F}, le filtre de
     * type de semaine est constant.
     *
     * <p>La file entrelace les groupes par {@code trainingOrder} croissant puis par
     * {@code goal} (ordre de {@code musculationGoals}) : pour chaque
     * {@code trainingOrder} présent (toutes orientations confondues), on ajoute le
     * groupe de chaque goal qui en possède un (un goal absent à ce cran est sauté).
     * Les exercices d'un groupe sont triés par identifiant croissant pour un ordre
     * déterministe. File vide si aucune orientation n'a d'exercice MS/F.</p>
     */
    private Deque<List<RefExercice>> buildMusculationGroups(List<RefGoal> musculationGoals) {
        // Pour chaque goal : groupes indexés par trainingOrder, exercices triés par id.
        Map<RefGoal, Map<Integer, List<RefExercice>>> groupsByGoal = new LinkedHashMap<>();
        Set<Integer> trainingOrders = new TreeSet<>();
        for (RefGoal goal : musculationGoals) {
            List<RefExercice> exercices = refExerciceRepository
                    .findByExerciceTypeAndWeekTypeAndGoalOrderByTrainingOrderAsc(
                            ExerciceType.MS, WeekTypeRef.F, goal);
            Map<Integer, List<RefExercice>> byOrder = new TreeMap<>();
            for (RefExercice exercice : exercices) {
                byOrder.computeIfAbsent(exercice.getTrainingOrder(), order -> new ArrayList<>()).add(exercice);
            }
            byOrder.values().forEach(group ->
                    group.sort(Comparator.comparing(RefExercice::getRefExerciceId)));
            groupsByGoal.put(goal, byOrder);
            trainingOrders.addAll(byOrder.keySet());
        }
        // Entrelacement : trainingOrder croissant, puis goals dans l'ordre.
        Deque<List<RefExercice>> queue = new ArrayDeque<>();
        for (Integer trainingOrder : trainingOrders) {
            for (RefGoal goal : musculationGoals) {
                List<RefExercice> group = groupsByGoal.get(goal).get(trainingOrder);
                if (group != null) {
                    queue.offer(group);
                }
            }
        }
        return queue;
    }

    /**
     * Émet <b>un</b> {@link ProgrammeExercice} (rattaché à la séance de la case,
     * positionné par {@code exerciceOrder}) et <b>une</b> {@link ProgrammeSeries}
     * par série de l'exercice (RG11) pour l'archétype de l'évaluation. Calcule les
     * charges de chaque série si une référence et un poids sont présents et que la
     * charge est demandée ({@code finalGoals} non null).
     */
    private void emitExercice(ProgrammeWeek week, Map<Integer, ProgrammeTraining> trainings, RefPlanning row,
                              RefExercice exercice, int basePercent,
                              Map<RefReference, Double> finalGoals, Archetype archetype) {
        ProgrammeExercice programmeExercice = addExercice(week, trainings, row, exercice.getExerciceName());
        List<RefExerciceSet> sets = setsForArchetype(exercice, archetype);
        for (RefExerciceSet set : sets) {
            ProgrammeSeries series = baseSeries(programmeExercice);
            series.setSetNumber(set.getSetNumber());
            series.setRepNumber(set.getRepNumber());
            applyCharge(series, finalGoals, exercice.getReference(), set.getWeight(), basePercent);
            programmeExercice.getProgrammeSeries().add(series);
        }
    }

    /**
     * Émet un exercice combiné Épaulé + Jeté (RG8 révisé) : <b>un</b>
     * {@link ProgrammeExercice} (nom {@code "{Épaulé} + {Jeté}"}) et <b>une</b>
     * {@link ProgrammeSeries} par couple de séries. Le CJ peut être
     * <b>multi-séries</b>, comme l'Arraché. On boucle sur les séries de l'Épaulé
     * (CL prévaut) et on apparie, par index, la série du Jeté correspondante.
     *
     * <p>Les séries CL et JK sont normalement identiques en base. Si leurs
     * nombres diffèrent, l'Épaulé fait foi : une série est émise par série CL ;
     * la série JK absente ({@code i >= jerkSets.size()}) est traitée comme nulle.
     * Le nombre de séries et la charge proviennent de la série CL courante
     * (référence Épaulé-Jeté = CJ) ; le libellé combiné des répétitions des deux
     * mouvements ({@code combinedRepLabel}) est désormais porté par
     * {@code series.repNumber} (plus de {@code rep_label}).</p>
     */
    private void emitCombined(ProgrammeWeek week, Map<Integer, ProgrammeTraining> trainings, RefPlanning row,
                              RefExercice clean, RefExercice jerk,
                              int basePercent, Map<RefReference, Double> finalGoals, Archetype archetype) {
        List<RefExerciceSet> cleanSets = setsForArchetype(clean, archetype);
        List<RefExerciceSet> jerkSets = setsForArchetype(jerk, archetype);
        if (cleanSets.isEmpty() || jerkSets.isEmpty()) {
            addPlaceholder(week, trainings, row, LABEL_CLEAN_JERK + SUFFIX_TO_DEFINE);
            return;
        }
        String combinedName = clean.getExerciceName() + " + " + jerk.getExerciceName();
        ProgrammeExercice programmeExercice = addExercice(week, trainings, row, combinedName);
        for (int i = 0; i < cleanSets.size(); i++) {
            RefExerciceSet cleanSet = cleanSets.get(i);
            RefExerciceSet jerkSet = i < jerkSets.size() ? jerkSets.get(i) : null;
            String repsCL = cleanSet.getRepNumber();
            String repsJK = jerkSet == null ? null : jerkSet.getRepNumber();

            ProgrammeSeries series = baseSeries(programmeExercice);
            series.setSetNumber(cleanSet.getSetNumber());
            series.setRepNumber(combinedRepLabel(repsCL, repsJK));
            // Charge sur la série de l'Épaulé courante, référence Épaulé-Jeté (CJ).
            applyCharge(series, finalGoals, clean.getReference(), cleanSet.getWeight(), basePercent);
            programmeExercice.getProgrammeSeries().add(series);
        }
    }

    /**
     * Label de répétitions d'une série combinée (RG8), désormais porté par
     * {@code repNumber}.
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

    /**
     * Remplace une valeur nulle par une chaîne vide (label combiné).
     */
    private String nullToEmpty(String value) {
        return value == null ? "" : value;
    }

    /**
     * Applique les charges min/max d'une série si référence + poids présents et charge demandée.
     */
    private void applyCharge(ProgrammeSeries series, Map<RefReference, Double> finalGoals,
                             RefReference reference, BigDecimal weight, int basePercent) {
        if (finalGoals == null || reference == null || weight == null) {
            return;
        }
        Double finalGoal = finalGoals.get(reference);
        if (finalGoal == null) {
            return;
        }
        double weekBase = chargeCalculator.weekBase(finalGoal, basePercent);
        series.setMinWeight(chargeCalculator.minWeight(weekBase, weight));
        series.setMaxWeight(chargeCalculator.maxWeight(weekBase, weight));
    }

    /**
     * Ajoute une case « à définir » : un exercice libellé fixe, sans série.
     */
    private void addPlaceholder(ProgrammeWeek week, Map<Integer, ProgrammeTraining> trainings, RefPlanning row,
                                String label) {
        addExercice(week, trainings, row, label);
    }

    /**
     * Ajoute une case à libellé fixe (RF / PC) : un exercice libellé fixe, sans série.
     */
    private void addFixedLabel(ProgrammeWeek week, Map<Integer, ProgrammeTraining> trainings, RefPlanning row,
                               String label) {
        addExercice(week, trainings, row, label);
    }

    /**
     * Crée un {@link ProgrammeExercice} (nom + {@code exerciceOrder} de la case)
     * rattaché à la séance de la case (récupérée ou créée via {@link #training}),
     * et le retourne pour y accrocher ses séries.
     */
    private ProgrammeExercice addExercice(ProgrammeWeek week, Map<Integer, ProgrammeTraining> trainings,
                                          RefPlanning row, String name) {
        ProgrammeTraining training = training(week, trainings, row.getTrainingOrder());
        ProgrammeExercice exercice = new ProgrammeExercice();
        exercice.setProgrammeTraining(training);
        exercice.setExerciceOrder(row.getExerciceOrder());
        exercice.setExerciceName(name);
        training.getProgrammeExercices().add(exercice);
        return exercice;
    }

    /**
     * Récupère ou crée la {@link ProgrammeTraining} (séance) d'un
     * {@code trainingNumber} donné dans une semaine (map locale par semaine). La
     * séance créée est rattachée à la semaine et porte son {@code trainingNumber}.
     */
    private ProgrammeTraining training(ProgrammeWeek week, Map<Integer, ProgrammeTraining> trainings,
                                       Integer trainingNumber) {
        return trainings.computeIfAbsent(trainingNumber, number -> {
            ProgrammeTraining training = new ProgrammeTraining();
            training.setProgrammeWeek(week);
            training.setTrainingNumber(number);
            week.getProgrammeTrainings().add(training);
            return training;
        });
    }

    /**
     * Crée une {@link ProgrammeSeries} rattachée à un exercice (valeurs à compléter).
     */
    private ProgrammeSeries baseSeries(ProgrammeExercice exercice) {
        ProgrammeSeries series = new ProgrammeSeries();
        series.setProgrammeExercice(exercice);
        return series;
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

    /**
     * Timeline (RG1) : séquence de types de semaine ; absente → règle métier (409).
     */
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

    /**
     * base_percent[1..weeks] ; indice 0 inutilisé ; semaine PC (dernière) = 100.
     */
    private int[] computeBasePercents(int weeks) {
        int usefulWeeks = weeks - 1;
        int[] basePercent = new int[weeks + 1];
        for (int i = 1; i <= usefulWeeks; i++) {
            basePercent[i] = weekPercentCalculator.basePercent(i, usefulWeeks);
        }
        basePercent[weeks] = WeekPercentCalculator.PRE_COMPETITION_PERCENT;
        return basePercent;
    }

    /**
     * Objectif technique depuis la chaîne de l'évaluation (EXT|CATCH|PATH), null si absent.
     */
    private RefGoal techniqueGoal(String value) {
        return value == null || value.isBlank() ? null : RefGoal.valueOf(value);
    }

    /**
     * Mapping profil force-vitesse → objectif squat/tirage (STRENGTH→STR, SPEED→SPD, MID|null→KEEP).
     */
    private RefGoal strengthSpeedGoal(StrengthSpeed strengthSpeed) {
        if (strengthSpeed == StrengthSpeed.STRENGTH) {
            return RefGoal.STR;
        }
        if (strengthSpeed == StrengthSpeed.SPEED) {
            return RefGoal.SPD;
        }
        return RefGoal.KEEP;
    }

    /**
     * Libellé « à définir » par type de case.
     */
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

    /**
     * Recherche d'exercices de référence avec cache local (évite le N+1 sur les semaines).
     */
    private List<RefExercice> findExercices(Map<ExerciceCacheKey, List<RefExercice>> cache,
                                            ExerciceType type, WeekTypeRef weekType, RefGoal goal, int order) {
        return cache.computeIfAbsent(
                new ExerciceCacheKey(type, weekType, goal, order),
                key -> refExerciceRepository.findByExerciceTypeAndWeekTypeAndGoalAndTrainingOrder(
                        key.type(), key.weekType(), key.goal(), key.order()));
    }

    /**
     * Clé de cache des exercices de référence par case de génération.
     */
    private record ExerciceCacheKey(ExerciceType type, WeekTypeRef weekType, RefGoal goal, Integer order) {
    }
}
