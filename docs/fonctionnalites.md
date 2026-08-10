# Functional Product Description — OBC Planner

> Cette application est à destination des coachs et a pour objectif de produire des plans d'entrainement d'haltérophilie 100% personnalisés
> en se basant sur des évaluations sur différents axes d'analyse (force, vitesse, technique, endurance, récupération).
> L'application n'a pas pour but d'être hébergée et tourne uniquement en local sur le poste du coach.
>
> L'application se base sur un référentiel de données pour calculer les forces et faiblesses de l'athlète et produire un plan d'entrainement adapté à son profil.

## Fonctionnalités principales

### Athlètes

L'application permet de gérer la liste des athlètes sous forme d'un tableau.
Il est possible d'ajouter/modifier/supprimer un athlète depuis une modale.
Chaque athlète possède un profil détaillé comprenant :
- Nom & prénom
- Âge
- Sexe
- Catégorie de Poids
- Niveau de compétition

*Toutes ces informations sont obligatoires.*

### Evaluations

Depuis le profil d'un athlète, il est possible de gérer ses évaluations (consultation, ajout, modification, suppression).
Il n'est pas possible de modifier ou supprimer une évaluation si un plan d'entrainement a déjà été généré à partir de cette évaluation.

Chaque évaluation est composée de plusieurs axes d'analyse :
- Force / Vitesse (`force` | `mixte` | `vitesse`)
- Technique (`irrégulier` | `fiable` | `technicien`)
- Endurance / Récupération (`charge` | `mixte` | `volume`)
- Psychologie
    - Forces : `calme` | `confiant` | `motivé` | `concentré` | `compétitif` | `challenger` | `autonome`
    - Faiblesses : `émotif` | `anxieux` | `indifférent` | `distrait` | `hédoniste` | `pragmatique` | `référentiel`

En fonction des résultats et combinaisons de ces différents axes d'analyse, on attribue un archétype à l'athlète (`mixte` | `bourrin` | `technicien` | `cyclique` | `apprentissage`).
- `mixte`
    - `mixte` / `fiable` / `mixte`
    - `mixte` / `fiable` / `endurant`
    - `mixte` / `irrégulier` / `mixte`
    - `mixte` / `spécialiste` / `mixte`
    - `force` / `fiable` / `mixte`
    - `force` / `spécialiste` / `mixte`
    - `vitesse` / `fiable` / `mixte`
    - `vitesse` / `spécialiste` / `endurant`
- `bourrin`
    - `force` / `fiable` / `endurant`
    - `force` / `irrégulier` / `mixte`
    - `force` / `irrégulier` / `endurant`
    - `force` / `spécialiste` / `endurant`
- `technicien`
    - `mixte` / `spécialiste` / `explosif`
    - `force` / `fiable` / `explosif`
    - `force` / `irrégulier` / `explosif`
    - `force` / `spécialiste` / `explosif`
    - `vitesse` / `irrégulier` / `explosif`
    - `vitesse` / `spécialiste` / `explosif`
- `cyclique`
    - `mixte` / `fiable` / `explosif`
    - `mixte` / `irrégulier` / `explosif`
    - `vitesse` / `fiable` / `explosif`
    - `vitesse` / `spécialiste` / `mixte`
- `apprentissage`
    - `mixte` / `irrégulier` / `endurant`
    - `mixte` / `spécialiste` / `endurant`
    - `vitesse` / `fiable` / `endurant`
    - `vitesse` / `irrégulier` / `mixte`
    - `vitesse` / `irrégulier` / `endurant`

### Programmation

À partir du résultat de l'évaluation, il est possible de générer un plan d'entrainement personnalisé pour l'athlète.

Le plan s'adapte à son profil et à ses objectifs :
- Nombre de semaines variable (`8` | `12` | `16`)
- Nombre de séances par semaine variable (`3` | `4` | `5`)
- Durée des séances variables (`1h30` | `2h00` | `2h30`)

Avant la génération du plan d'entrainement, le coach peut ajuster manuellement les résultats de l'évaluation pour affiner le plan d'entrainement.
Après la génération du plan, il est possible de modifier manuellement les séances et les exercices pour personnaliser encore plus le plan d'entrainement.

Le plan d'entrainement est proposé dans un tableau par semaine.
En entête de chaque semaine, on retrouve les informations suivantes :
```
Semaine n° XX / XX (date de début - date de fin)
Type : [foncier | technique | surcharge | affûtage | deload] | Base : XX% de l'objectif
Arraché : XX kg | Épaulé-jeté : XX kg | Flexion Nuque : XX kg | Flexion Avant : XX kg | Tirage Arraché : XX kg | Tirage Épaulé : XX kg
```

Chaque séance est disposé dans une colonne où chaque ligne correspond à un exercice.
Chaque exercice est détaillé avec les informations suivantes :
```
Nom de l'exercice
X séries x Y répétitions @ charge min - charge max kg

.../.../.../.../.../.../.../...
```

### Référentiel

Le référentiel contient les données nécessaires pour réaliser les évaluations et générer les plans d'entrainement.
Un écran permet de gérer le référentiel (consultation, ajout, modification, suppression).
Il est composé de plusieurs entités / onglets :
- Exercices : liste des exercices avec leurs caractéristiques (nom, type, charge de travail)
- Correctifs : liste des exercices et de leurs correctifs associés
- Archétypes : associations des différents profils d'athlètes
- Trame générale : définition des semaines et séances types pour chaque archétype d'athlète