# Architecture — OBC Planner

> Ce fichier doit être mis à jour à chaque modification structurelle (libs, packages, tables, APIs).

---

## Backend — Spring Boot 4.1 / Java 25

### Structure des packages

```
com.example.backend
├── BackEndApplication.java
├── annotations/        # Annotations custom : contrôle d'accès, AOP, validators (email, téléphone)
├── aspects/            # Implémentations AOP des annotations (logs, activation conditionnelle)
├── configuration/      # Sécurité Spring, CORS, JWT filter chain
├── controllers/        # Endpoints REST — délèguent aux services, aucune logique métier
├── dto/                # Objets de transfert (*Request / *Response)
├── entities/           # Entités JPA mappées sur les tables PostgreSQL
├── filter/             # Filtres HTTP (validation JWT sur chaque requête)
├── interceptor/        # Intercepteurs MVC (contrôle d'accès par annotation)
├── repositories/       # Interfaces Spring Data JPA
├── services/           # Interfaces métier + implémentations (sous-dossier impl/)
└── utils/              # Utilitaires transversaux (dates, strings, numbers, objects)
```

### Dépendances Maven (compile)

| Dépendance | Version | Rôle |
|---|---|---|
| spring-boot-starter-webmvc | 4.1.0 | REST API, Tomcat embarqué |
| spring-boot-starter-data-jpa | 4.1.0 | JPA / Hibernate |
| spring-boot-starter-security | 4.1.0 | Sécurité, filter chain |
| spring-boot-starter-validation | 4.1.0 | Validation Jakarta |
| spring-boot-starter-flyway | 4.1.0 | Migrations base de données |
| spring-boot-starter-jackson | 4.1.0 | Sérialisation JSON |
| hibernate-core | 7.4.1.Final | ORM |
| spring-security-* | 7.1.0 | Auth, crypto, web |
| spring-* (core, web, orm…) | 7.0.8 | Framework Spring |
| jjwt-api / jjwt-impl / jjwt-jackson | 0.13.0 | Génération et validation JWT |
| jackson-databind / jackson-core | 2.21.4 | Sérialisation JSON |
| flyway-core / flyway-database-postgresql | 12.4.0 | Migrations PostgreSQL |
| HikariCP | 7.0.2 | Pool de connexions |
| lombok | 1.18.46 | Réduction boilerplate |
| aspectjweaver | 1.9.25.1 | Support AOP |
| logback-classic | 1.5.34 | Logging (SLF4J) |

### API REST

Base URL: `/api`

| Méthode | Endpoint | Java Class | Description |
|---|---|---|---|
| GET | /athletes | AtheteController | Liste des athlètes |
| GET | /athletes/{id} | AtheteController | Détail d'un athlète |

---

## Frontend — Angular 20

### Structure des modules

```
src/app/
├── app.component.*     # Composant racine
├── app.config.ts       # Configuration standalone (providers, i18n, HTTP)
├── app.routes.ts       # Définition des routes
├── components/         # Composants UI (layout global, liste athlètes, modal formulaire)
├── models/             # Interfaces TypeScript correspondant aux DTOs backend
└── services/           # Services HTTP par domaine métier + loader i18n custom
```

### Dépendances Node

| Dépendance | Version | Rôle |
|---|---|---|
| @angular/* | ^20.3.25 | Framework Angular |
| @awesome.me/webawesome | ^3.9.0 | Bibliothèque de composants UI |
| @fortawesome/fontawesome-free | ^7.3.1 | Icônes Font Awesome |
| @ngx-translate/core | ^18.0.0 | Internationalisation (i18n) |
| @ngx-translate/http-loader | ^18.0.0 | Chargement des fichiers de traduction |
| tailwindcss | ^4.3.1 | Utilitaires CSS |
| rxjs | ~7.8.0 | Programmation réactive |
| zone.js | ~0.15.1 | Change detection Angular |
| typescript | ~5.8.3 | Langage |

---

## Base de données — PostgreSQL 17

### Schéma

#### `athletes`
| Colonne | Type | Nullable | Contrainte |
|---|---|---|---|
| id | VARCHAR(255) | NO | PK |
| prenom | VARCHAR(255) | YES | |
| nom | VARCHAR(255) | YES | |
| sexe | VARCHAR(255) | YES | |
| date_naissance | DATE | YES | |

#### `evaluations`
| Colonne | Type | Nullable | Contrainte |
|---|---|---|---|
| id | VARCHAR(255) | NO | PK |
| id_athlete | VARCHAR(255) | YES | FK → athletes.id |
| date_evaluation | DATE | YES | |
| poids_kg | NUMERIC | YES | |
| niveau | VARCHAR(255) | YES | |

#### `profils_force_vitesse`
| Colonne | Type | Nullable | Contrainte |
|---|---|---|---|
| id_evaluation | VARCHAR(255) | NO | PK, FK → evaluations.id |
| detente_avec_elan_cm | NUMERIC | YES | |
| detente_seche_cm | NUMERIC | YES | |
| squat_30pct_mps | NUMERIC | YES | |
| squat_50pct_mps | NUMERIC | YES | |
| squat_70pct_mps | NUMERIC | YES | |
| tirage_haut_80pct_mps | NUMERIC | YES | |
| ratio_3rm_front_squat | NUMERIC | YES | |
| ratio_3rm_back_squat | NUMERIC | YES | |
| ratio_3rm_tirage_arrache | NUMERIC | YES | |
| ratio_3rm_tirage_epj | NUMERIC | YES | |
| grip_pct_bw | NUMERIC | YES | |
| profil_resultat | VARCHAR(255) | YES | |

#### `profils_neuromusculaires`
| Colonne | Type | Nullable | Contrainte |
|---|---|---|---|
| id_evaluation | VARCHAR(255) | NO | PK, FK → evaluations.id |
| type_protocole | INTEGER | YES | |
| bpm_tension_au_repos | VARCHAR(255) | YES | |
| bpm_tension_sous_fatigue | VARCHAR(255) | YES | |
| duree_du_protocole | VARCHAR(255) | YES | |
| duree_de_recuperation | VARCHAR(255) | YES | |
| max_reps_squat_nuque_70pct | INTEGER | YES | |
| max_reps_tirage_epaule_70pct | INTEGER | YES | |
| pct_arrache_3reps | NUMERIC | YES | |
| pct_arrache_2reps | NUMERIC | YES | |
| pct_epj_3reps | NUMERIC | YES | |
| pct_epj_2reps | NUMERIC | YES | |
| gainage_planche_sec | INTEGER | YES | |
| gainage_planche_50pct_bw_sec | INTEGER | YES | |
| gainage_planche_100pct_bw_sec | INTEGER | YES | |
| profil_resultat_cardio | VARCHAR(255) | YES | |
| profil_resultat_musculaire | VARCHAR(255) | YES | |

#### `profils_psychologiques`
| Colonne | Type | Nullable | Contrainte |
|---|---|---|---|
| id_evaluation | VARCHAR(255) | NO | PK, FK → evaluations.id |
| score_gestion_emotionnelle | INTEGER | YES | |
| score_confiance | INTEGER | YES | |
| score_motivation | INTEGER | YES | |
| score_concentration | INTEGER | YES | |
| score_competition | INTEGER | YES | |
| score_rapport_echec | INTEGER | YES | |
| score_autonomie | INTEGER | YES | |
| forces | VARCHAR(255) | YES | |
| faiblesses | VARCHAR(255) | YES | |

#### `profils_techniques`
| Colonne | Type | Nullable | Contrainte |
|---|---|---|---|
| id_evaluation | VARCHAR(255) | NO | PK, FK → evaluations.id |
| taux_reussite_arrache | NUMERIC | YES | |
| taux_reussite_epj | NUMERIC | YES | |
| taux_reussite_1er_essai_arrache | NUMERIC | YES | |
| taux_reussite_1er_essai_epj | NUMERIC | YES | |
| points_forts | VARCHAR(255) | YES | |
| points_faibles | VARCHAR(255) | YES | |
| profil_resultat | VARCHAR(255) | YES | |

#### `catalogue_exercices`
| Colonne | Type | Nullable | Contrainte |
|---|---|---|---|
| id | INTEGER | NO | PK (auto-increment) |
| type_mouvement | VARCHAR(255) | YES | |
| categorie | VARCHAR(255) | YES | |
| nom_exercice | VARCHAR(255) | YES | |
| id_exercice_reference | INTEGER | YES | FK → catalogue_exercices.id |
| pct_charge_theorique | NUMERIC | YES | |

#### `exercices_correctifs`
| Colonne | Type | Nullable | Contrainte |
|---|---|---|---|
| id_exercice | INTEGER | NO | PK, FK → catalogue_exercices.id |
| id_exercice_correctif | INTEGER | NO | PK, FK → catalogue_exercices.id |

### Index

| Table | Index | Type | Colonnes |
|---|---|---|---|
| athletes | athletes_pkey | UNIQUE | id |
| catalogue_exercices | catalogue_exercices_pkey | UNIQUE | id |
| evaluations | evaluations_pkey | UNIQUE | id |
| exercices_correctifs | exercices_correctifs_pkey | UNIQUE | id_exercice, id_exercice_correctif |
| profils_force_vitesse | profils_force_vitesse_pkey | UNIQUE | id_evaluation |
| profils_neuromusculaires | profils_neuromusculaires_pkey | UNIQUE | id_evaluation |
| profils_psychologiques | profils_psychologiques_pkey | UNIQUE | id_evaluation |
| profils_techniques | profils_techniques_pkey | UNIQUE | id_evaluation |

> ⚠️ Seuls les index de clés primaires existent actuellement. Ajouter des index sur `evaluations.id_athlete` et les colonnes fréquemment filtrées lors de la montée en charge.
