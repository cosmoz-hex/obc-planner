package com.example.backend.utils;

import com.example.backend.entities.RefExercice;
import com.example.backend.enums.ExerciceType;
import com.example.backend.enums.RefGoal;
import com.example.backend.enums.WeekTypeRef;
import com.example.backend.repositories.RefExerciceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Deque;
import java.util.List;
import java.util.Map;

/**
 * Construction de la file de musculation d'un programme (RG9).
 *
 * <p>Les orientations de musculation de l'évaluation sont encodées en bitmask
 * ({@code GENERAL=1, LEGS=2, POSTERIOR_CHAIN=4, UPPER_BODY=8}). Pour chaque
 * orientation cochée, on récupère les exercices de musculation de référence
 * (type {@link ExerciceType#MS}, semaine {@link WeekTypeRef#F}) ordonnés par
 * numéro d'ordre, puis on construit une file en <b>round-robin</b> : un exercice
 * de chaque orientation à tour de rôle (g1, g2, g1, g2, …) jusqu'à épuisement.</p>
 *
 * <p>Si aucune orientation n'est cochée ({@code musculation} null ou 0), on force
 * {@link RefGoal#GEN} (décision validée). Une orientation sans aucun exercice en
 * base est ignorée. La file est <b>rotative</b> : chaque pioche renvoie la tête
 * et la replace en fin, de sorte que les exercices se répètent cycliquement sur
 * les semaines.</p>
 */
@Component
@RequiredArgsConstructor
public class MusculationQueueBuilder {

    private static final int GENERAL = 1;
    private static final int LEGS = 2;
    private static final int POSTERIOR_CHAIN = 4;
    private static final int UPPER_BODY = 8;

    private final RefExerciceRepository refExerciceRepository;

    /**
     * Convertit le bitmask de musculation en liste ordonnée d'objectifs
     * {@code [GEN?, LEGS?, POST?, UPPER?]}. Vide (null ou 0) → {@code [GEN]}.
     */
    public List<RefGoal> bitmaskToGoals(Integer musculation) {
        int mask = musculation == null ? 0 : musculation;
        List<RefGoal> goals = new ArrayList<>();
        if ((mask & GENERAL) != 0) {
            goals.add(RefGoal.GEN);
        }
        if ((mask & LEGS) != 0) {
            goals.add(RefGoal.LEGS);
        }
        if ((mask & POSTERIOR_CHAIN) != 0) {
            goals.add(RefGoal.POST);
        }
        if ((mask & UPPER_BODY) != 0) {
            goals.add(RefGoal.UPPER);
        }
        if (goals.isEmpty()) {
            goals.add(RefGoal.GEN);
        }
        return goals;
    }

    /**
     * Construit la file de musculation rotative pour une évaluation donnée.
     *
     * @param musculation bitmask des orientations de musculation
     */
    public MusculationQueue build(Integer musculation) {
        List<RefGoal> goals = bitmaskToGoals(musculation);

        // Une liste d'exercices par orientation (triée par numéro d'ordre).
        Map<RefGoal, List<RefExercice>> byGoal = new java.util.LinkedHashMap<>();
        for (RefGoal goal : goals) {
            List<RefExercice> exercices = refExerciceRepository
                    .findByExerciceTypeAndWeekTypeAndGoalOrderByTrainingOrderAsc(
                            ExerciceType.MS, WeekTypeRef.F, goal);
            if (!exercices.isEmpty()) {
                byGoal.put(goal, exercices);
            }
        }

        // Round-robin : un exercice de chaque orientation à tour de rôle.
        Deque<RefExercice> queue = new ArrayDeque<>();
        int maxSize = byGoal.values().stream().mapToInt(List::size).max().orElse(0);
        for (int index = 0; index < maxSize; index++) {
            for (List<RefExercice> exercices : byGoal.values()) {
                if (index < exercices.size()) {
                    queue.offer(exercices.get(index));
                }
            }
        }
        return new MusculationQueue(queue);
    }

    /**
     * File rotative d'exercices de musculation. {@link #rotate()} renvoie la tête
     * et la replace en fin ; renvoie {@code null} seulement si la file est vide
     * (aucun exercice de musculation en base pour les orientations retenues).
     */
    public static final class MusculationQueue {

        private final Deque<RefExercice> queue;

        private MusculationQueue(Deque<RefExercice> queue) {
            this.queue = queue;
        }

        /** Dépile la tête et la replace en fin de file (cycle), ou {@code null} si vide. */
        public RefExercice rotate() {
            RefExercice head = queue.poll();
            if (head != null) {
                queue.offer(head);
            }
            return head;
        }

        /** Indique si la file est vide (aucun exercice disponible). */
        public boolean isEmpty() {
            return queue.isEmpty();
        }
    }
}
