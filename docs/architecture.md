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

### Schéma (Mermaid)

classDiagram

    ATHLETE <-- EVAL_SUMMARY

    EVAL_SUMMARY <-- EVAL_DETAIL
    EVAL_SUMMARY <-- REF_ARCHETYPE
    EVAL_SUMMARY <-- PROG

    PROG <-- PROG_WEEK
    PROG_WEEK <-- PROG_TRAINING

    EXERCICE <-- PROG_TRAINING
    CORRECTION --> EXERCICE

    REF_TIMELINE <-- REF_PLANNING

    class ATHLETE {
        # ATHLETE_ID
        FIRST_NAME
        LAST_NAME
        SEXE
        AGE_CATEGORIE
        WEIGHT_CATEGORIE
        COMP_LEVEL
    }
    class EVAL_SUMMARY {
        # EVALUATION_ID
        + ATHLETE_ID
        EVALUATION_DATE
        ARCHETYPE
        STRENGTH_SPEED
        TECHNIQUE
        ENDURANCE
        SQUAT
        PULL
        SNATCH_STRENTGH
        SNATCH_WEAKNESS
        CLEAN_STRENTGH
        CLEAN_WEAKNESS
        JERK_STRENTGH
        JERK_WEAKNESS
        PSYCHO_STRENTGH
        PSYCHO_WEAKNESS
    }
    class EVAL_DETAIL {
        # EVALUATION_DETAIL_ID
        + EVALUATION_ID
        EVAL_CATEGORIE
        EXERCICE_CODE
        REAL_VALUE
        RESULT
    }
    class EXERCICE {
        # EXERCICE_ID
        + EXERCICE_REF
        CATEGORIE_EXERCICE
        TYPE_EXERCICE
        EXERCICE_CODE
        ESTIMATE_VALUE
    }
    class CORRECTION {
        # EXERCICE_ID
        # CORRECTION_ID
    }
    class PROG {
        # PROGRAMME_ID
        + EVALUATION_ID
        WEEKS
        FREQUENCY
        DURATION
        START_DATE
        END_DATE
        SNACHT_GOAL
        CJ_GOAL
    }
    class PROG_WEEK {
        # PROGRAMME_WEEK_ID
        + PROGRAMME_ID
        WEEK_NUMBER
        START_DATE
        END_DATE
        WEEK_TYPE
        BASE_PERCENT
        SNACHT_GOAL
        CJ_GOAL
        BACK_SQUAT_GOAL
        FRONT_SQUAT_GOAL
        SNACHT_PULL_GOAL
        CJ_PULL_GOAL
    }
    class PROG_TRAINING {
        # PROGRAMME_TRAINING_ID
        + PROGRAMME_WEEK_ID
        EXERCICE_ORDER
        EXERCICE_ID
        SET_NUMBER
        REP_NUMBER
        MIN_WEIGHT
        MAX_WEIGHT
    }
    class REF_ARCHETYPE {
        # REF_ARCHETYPE_ID
        ARCHETYPE
        STRENGTH_SPEED
        TECHNIQUE
        ENDURANCE
    }
    class REF_TIMELINE {
        # REF_TIMELINE
        ARCHETYPE
        WEEKS
        TIMELINE
    }
    class REF_PLANNING {
        # REF_PLANNING
        + REF_TIMELINE
        WEEK_TYPE
        DAY_OF_WEEK
        EXERCICE_ORDER
        CATEGORIE_EXERCICE
        TYPE_EXERCICE
        STRENGH_WEAKNESS
        SET_NUMBER
        REP_NUMBER
    }