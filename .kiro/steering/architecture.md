---
title: Architecture
inclusion: always
---

# Architecture — OBC Planner

> ⚠️ Projet en développement initial — la structure évolue rapidement.
> Pour plus de détails voir le fichier `docs/architecture.md`.

## Stack
- **Backend** : Spring Boot 4.1 / Java 25
- **Frontend** : Angular 20 standalone + Tailwind + WebAwesome
- **BDD** : PostgreSQL 17 + Flyway

## Structure packages backend
- `controllers/` : REST endpoints → délèguent aux services
- `services/` : logique métier (interfaces + impl/)
- `repositories/` : Spring Data JPA
- `entities/` : JPA entities
- `dto/` : Request/Response objects

## Domaine métier
Application de planification d'entrainement d'haltérophilie basée sur :
- Profils athlètes (force/vitesse, technique, endurance, psycho)
- Évaluations → calcul archétype → génération plan personnalisé
- Référentiel d'exercices et correctifs

> Détails du schéma BDD : voir migrations Flyway `db/migration/`