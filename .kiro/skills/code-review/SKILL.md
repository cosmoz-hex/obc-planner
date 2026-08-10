# Skill : Code Review

**Utilisateur** : @reviewer

## Description
Valide que le code respecte 100% `.kiro/steering/dev-practices.md` (déjà en contexte).

## Référence des règles
**Toutes les règles sont dans `.kiro/steering/dev-practices.md`** (injecté automatiquement).

## Processus de review

### 1. Vérifier conformité dev-practices.md (30 min)

Consulter chaque section de `dev-practices.md` :
- **Java / Spring Boot** : Lombok, injection constructeur, architecture 3 couches, DTOs, validation, transactions, logging, Streams/Optional
- **Angular** : Standalone, signals, @if/@for, inject(), i18n, WebAwesome+Tailwind, accessibilité
- **PostgreSQL** : Nommage, types, index, contraintes, requêtes optimisées
- **Git** : Conventions commit (sera vérifié par @commiteur)

**Vérification automatique** :
```bash
# Backend
mvn clean compile && \
grep -r "@Autowired.*private" src/main/java && \
grep -r "FetchType.EAGER" src/main/java && \
grep -r "SELECT \*" src/main/java

# Frontend  
ng build --configuration development && \
grep -r "\*ngIf\|\*ngFor" src/app && \
grep -r "\.css" src/app && \
grep -r ": any" src/app
```

### 2. Vérifier complétude (10 min)
- Toutes specs @architecte implémentées ?
- Cas limites gérés ?
- i18n complète (fr + en synchronisés) ?

### 3. Vérifier qualité (10 min)
- Pas de code dupliqué, typage strict, noms explicites
- Pas de TODO/FIXME, magic numbers
- Validation inputs (backend + frontend)

### 4. Vérifier régression (5 min)
- Signatures existantes non modifiées ?
- Migrations BDD réversibles ?
- Pas de breaking changes ?

### 5. Vérifier performance (5 min)
- Pas de requêtes N+1 (boucle avec requête chaque itération)
- Index sur toutes FK et colonnes WHERE/JOIN
- Pagination si liste > 100 items
- JPA favorisé (pas SQL brutes)
- SELECT précis (pas `SELECT *`)

## Output

### Si ✅ APPROUVÉ
```markdown
# Review : ✅ APPROUVÉ

Code conforme dev-practices.md, fonctionnalités complètes, pas de régression.

Validation :
- ✅ Conformité dev-practices.md
- ✅ Complétude fonctionnelle
- ✅ Qualité code
- ✅ Régression : Aucune
- ✅ Performance : OK
```

### Si ❌ REFUSÉ
```markdown
# Review : ❌ REFUSÉ

## Problèmes bloquants

### Conformité dev-practices ❌
- ❌ `Fichier.java:15` : [Règle violée - citer section dev-practices.md]
  ```
  // ❌ AVANT : [code]
  // ✅ APRÈS : [code selon dev-practices.md]
  ```

### Complétude / Bugs / Régression / Performance
- [Liste problèmes avec fichier:ligne]

## Actions requises
[Corrections à apporter]

## Itération : n°X / 3
```

## Notes
- **dev-practices.md = source de vérité** (déjà en contexte, pas besoin de redéfinir)
- **Bloquant ❌** : Non-conformité dev-practices, spec manquante, bug, régression, N+1
- **Toujours** : fichier:ligne + exemple correction avant/après

## Usage unitaire
```
@reviewer "Review ces fichiers/changements : [description]"
```
