# Base de Données et Modélisation - OBC Planner

## 🗄️ Architecture Relationnelle (SQL)

La base de données d'OBC Planner a été modélisée de zéro pour répondre aux exigences complexes du suivi d'haltérophilie. Elle repose sur un schéma relationnel robuste permettant de lier les athlètes, le catalogue technique (Table de Baroga) et les évaluations biomécaniques et psychologiques.

---

## 🏗️ Structure des Données

Le modèle de données est organisé autour de plusieurs pôles principaux :

### 1. Pôle Utilisateur
*   **`athletes` :** Table principale stockant l'identité (ID, nom, prénom, sexe, date de naissance).

### 2. Pôle Technique (Catalogue & Mouvements)
*   **`catalogue_exercices` :** Table hiérarchique contenant l'ensemble des mouvements. Elle utilise une auto-référence (`id_exercice_reference`) pour lier les exercices dérivés (ex: *Arraché Flexion*) à leur mouvement racine (ex: *Arraché*). Elle inclut également le pourcentage de charge théorique.
*   **`exercices_correctifs` :** Table de liaison (Many-to-Many) permettant d'associer un exercice spécifique à une liste d'exercices correctifs recommandés.

### 3. Pôle Évaluation
*   **`evaluations` :** Table centrale pour chaque test, liée à un athlète avec la date, le poids de corps et le niveau global.
*   **`performances_evaluation` :** Table de liaison stockant la charge réalisée (kg) pour un exercice précis lors d'une évaluation.

### 4. Pôle Profilage (Analyse Poussée)
Pour une granularité maximale, les résultats d'une évaluation sont segmentés en quatre dimensions :
*   **`profils_force_vitesse` :** Mesures physiques (détente, squat, tirage, ratios de force, grip).
*   **`profils_techniques` :** Taux de réussite sur les mouvements classiques (Arraché, Épaulé-Jeté) et analyse des points forts/faibles.
*   **`profils_neuromusculaires` :** Données physiologiques (tension, récupération) et endurance musculaire (max reps, gainage).
*   **`profils_psychologiques` :** Scores sur la gestion émotionnelle, la confiance, la motivation, la concentration et le rapport à l'échec.

---

## 🔄 Stratégie d'Initialisation (Seeding)

Un script SQL complet a été développé pour assurer la migration et l'initialisation des données de référence (issues initialement d'un format tableur).

*   **Idempotence :** Le script utilise des commandes `DELETE FROM ... WHERE 1=1` avant les insertions pour garantir qu'il peut être exécuté plusieurs fois sans créer de doublons.
*   **Intégration de la Table de Baroga :** Insertion automatisée de plus de 100 exercices classifiés (TECH, SEMI_TECH_LOURD, COMBINE, RENFO_SPE) et de leurs pourcentages théoriques.
*   **Règles de suppression en cascade :** Utilisation de `ON DELETE CASCADE` sur les tables de liaison pour maintenir l'intégrité référentielle de la base.