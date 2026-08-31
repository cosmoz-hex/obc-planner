---
name: api-builder
description: "
    Créer ou faire évoluer une API REST dans OBC Planner (endpoint sous /api) en respectant l'architecture Controller → Service → Repository, 
    les DTOs records, la sécurité JWT et la gestion d'erreurs centralisée. 
    À utiliser quand le besoin porte spécifiquement sur l'exposition ou la modification d'un endpoint backend.
"
allowed-tools: Read, Write, Edit, Grep, Glob, CodeIntelligence, Shell
---

# Mettre en place une API

Conçoit et implémente un endpoint REST backend complet et conforme, de la couche repository jusqu'au controller, avec les DTOs et la sécurité adéquats.

## Quand l'utiliser

- Pour ajouter un nouvel endpoint sous `/api`.
- Pour modifier le contrat d'une API existante (paramètres, réponse, pagination).
- Quand le frontend a besoin d'un nouveau point d'accès aux données.

## Références obligatoires

- `.kiro/steering/spring-convention.md` — section Java/Spring : 3 couches, interfaces+impl, Lombok, DTOs records `*Request`/`*Response`, `@RestControllerAdvice`, format d'erreur, sécurité JWT, `@Transactional`, pagination `Pageable`.
- `.kiro/steering/architecture.md` — base URL `/api`, tableau des APIs (**à compléter**), packages `controllers/`, `services/`, `repositories/`, `dto/`, `entities/`.
- `.kiro/steering/product.md` — sémantique métier de la ressource exposée.

## Contrat d'entrée

```
RESSOURCE      : <entité / concept métier exposé>
OPÉRATIONS     : <ex. lister paginé, créer, modifier, supprimer>
RÈGLES MÉTIER  : <contraintes, validations, autorisations>
CONTRAT E/S    : <optionnel : forme attendue des requêtes/réponses>
```

## Procédure

1. **Cadrer le contrat** : méthode HTTP, chemin sous `/api`, paramètres, corps, codes de réponse, pagination si liste.
2. **Repository** : interface Spring Data JPA ou CustomRepository pour les requêtes plus complexes.
3. **DTOs** : records `*Request` (entrée, avec validation `jakarta.validation`) et `*Response` (sortie). Ne jamais exposer l'entité.
4. **Service** : interface + implémentation (`impl/`), logique métier, `@Transactional` pour les opérations multiples/critiques, mapping entité ↔ DTO.
5. **Controller** : délègue au service, aucune logique métier ; validation via `@Valid` ; retourne des DTOs et des statuts HTTP corrects.
6. **Sécurité** : appliquer le contrôle d'accès au niveau adéquat (configuration/filter/interceptor/annotation) ; ne jamais exposer de stack trace ; erreurs structurées `[{timestamp}] {level} {class}.{method} - {message}`.
7. **Vérifier** : `mvn -q -f back-end/pom.xml compile`. Corriger les erreurs.
8. **Documenter** : ajouter la ligne dans le tableau des APIs de `architecture.md`.

## Livrables

- Repository, service (interface + impl), DTOs, controller.
- Ligne(s) ajoutée(s) au tableau des APIs de `architecture.md`.
- Compte-rendu : contrat de l'endpoint (méthode, chemin, E/S, statuts), fichiers créés/modifiés, résultat de compilation.

## Critères de qualité

- Endpoint sous `/api`, contrat clair et cohérent avec les APIs existantes.
- 3 couches respectées ; controller sans logique métier.
- DTOs records validés ; entités non exposées.
- Requêtes paramétrées ; pagination sur les listes volumineuses.
- Sécurité et gestion d'erreurs conformes ; aucune fuite de stack trace.
- Le backend compile ; `architecture.md` est à jour.
- Respect des règles écrites dans `spring-convention.md`.
