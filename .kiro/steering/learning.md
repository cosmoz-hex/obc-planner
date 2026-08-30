---
title: Learning
inclusion: always
---

# Apprentissages et retours d'expérience

Ce fichier est un journal de connaissances acquises au fil du développement.
Kiro doit y consigner toute leçon apprise suite à une correction demandée par l'utilisateur, une erreur de jugement, ou un écart par rapport aux bonnes pratiques du projet.

## Règles d'utilisation

- **Quand écrire ici ?** À chaque fois qu'une correction est demandée sur un choix technique ou un pattern proposé par Kiro et qui s'avère incorrect ou non conforme aux pratiques du projet.
- **Format** : une entrée courte, factuelle, avec le contexte et la bonne pratique retenue.
- **Objectif** : ne jamais reproduire la même erreur deux fois.

---

## Leçons apprises

### 2026-08-18 — Exercices composés squat + box jump : rep_number
- **Contexte** : Pour un exercice "Flexion Nuque Excentrique + Box Jump" avec format `4 x (4 + 8)`.
- **Erreur initiale** : Additionner les reps squat + box jump dans `rep_number` (4+8=12).
- **Bonne pratique** : `rep_number` ne compte que les reps à la barre (squat). Les box jumps sont sans barre, donc `rep_number=4`. On additionne uniquement quand les 2 mouvements sont à la barre (ex: front + back squat).

### 2026-08-18 — Notation `n (1 + 1)` dans les protocoles
- **Contexte** : Le PDF note `4 x 2 (1 + 1)` pour un exercice composé (tirage haut + tirage haut suspension).
- **Erreur initiale** : Interpréter `2 (1 + 1)` comme 2 reps au lieu de `2 × (1+1) = 4` reps.
- **Bonne pratique** : `n (1 + 1)` est une notation mathématique. `2 (1 + 1) = 4` reps totales à la barre. `rep_label = '2 (1 + 1)'` pour l'affichage, `rep_number = 4` pour le volume réel.

### 2026-08-30 — Toujours annoncer l'Agent/skill et suivre la pipeline de dev
- **Contexte** : Sur plusieurs demandes (migration, refactor UI), Kiro a agi « en direct » sans nommer l'Agent incarné ni le skill appliqué, ni indiquer les étapes de pipeline sautées.
- **Erreur initiale** : Exécuter la tâche sans traçabilité, privant l'utilisateur de la visibilité sur ce qui est fait et sur ce qui pourrait manquer.
- **Bonne pratique** : À chaque demande impliquant du code, préciser en tête et à chaque bascule : l'Agent (Analyste/Développeur/Reviewer/Testeur/Documentaliste), le(s) skill(s) appliqué(s), les étapes volontairement sautées + justification (parcimonie), et les boucles de feedback. Pour une simple question de compréhension, l'indiquer explicitement comme « hors pipeline ». Ce comportement doit être automatique, sans que l'utilisateur ait à le redemander dans son prompt.
