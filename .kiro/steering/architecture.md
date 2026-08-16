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

### API REST

Base URL: `/api`

| Méthode | Endpoint | Java Class | Description |
|---|---|---|---|

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

---

## Base de données — PostgreSQL 17

### Schéma