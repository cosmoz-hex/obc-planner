# Skill : Technical Design

**Utilisateur** : @architecte

## Description
Génère le design technique détaillé : fichiers, méthodes, API, tables BDD, migrations. Spécifie les signatures précises pour que @developpeur puisse implémenter sans ambiguïté.

## Usage
Charge ce skill pour concevoir l'architecture technique d'une feature/bugfix.

## Input
Document de besoins enrichi de @analyste avec contraintes et patterns existants.

## Processus

### 1. Design backend
- Lister tous les fichiers à créer/modifier
- Spécifier signatures méthodes (params, return, exceptions)
- Définir endpoints API (méthode HTTP, path, request/response DTOs)
- Préciser validations Jakarta (@NotNull, @Min, @Max, @Size)

### 2. Design frontend
- Lister composants, services, models
- Spécifier signals et méthodes principales
- Définir structure formulaires (ReactiveForm fields + validators)
- Lister imports WebAwesome nécessaires

### 3. Design BDD
- Écrire script migration Flyway complet
- Définir tables, colonnes, types, contraintes
- Spécifier index (sur FK, WHERE, JOIN, ORDER BY)
- Vérifier idempotence (IF NOT EXISTS)

### 4. Analyse d'impact
- Identifier risques régression
- Évaluer impact performance (N+1, index manquants)
- Signaler breaking changes éventuels

## Output
Design technique complet avec code squelette (signatures, pas implémentations complètes).
