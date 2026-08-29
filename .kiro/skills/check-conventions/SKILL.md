---
name: check-conventions
description: Vérifier la conformité d'un changement de code OBC Planner aux conventions du projet (architecture 3 couches, Lombok, DTOs, Flyway, Angular standalone/Signals, i18n, nommage). À utiliser en revue pour garantir la cohérence et la maintenabilité avant intégration.
allowed-tools: Read, Grep, Glob, CodeIntelligence
---

# Contrôler les bonnes pratiques de développement

Analyse un changement pour détecter les écarts aux conventions de `*-convention.md`, sur les trois stacks (Java/Spring, Angular, PostgreSQL) et Git. Le skill **détecte et recommande** ; il ne corrige pas.

## Quand l'utiliser

- En revue, sur tout changement de code, comme contrôle transversal de conformité.
- Après `git-diff`, en complément des contrôles régressions/sécurité/perf/accessibilité.

## Références obligatoires

- `.kiro/steering/*-convention.md` — **référentiel des conventions** (Java/Spring, Angular, PostgreSQL, Git). Grille principale.
- `.kiro/steering/architecture.md` — bon emplacement des éléments (packages, modules) ; doit être à jour si la structure change.
- `.kiro/steering/learning.md` — pièges connus à ne pas reproduire.

## Contrat d'entrée

```
CHANGEMENT   : <diff/PR ou fichiers modifiés>
PÉRIMÈTRE    : <optionnel : back / front / SQL>
```

## Procédure

1. **Backend Java/Spring** : Lombok utilisé ; injection par constructeur (pas de `@Autowired` sur champ) ; 3 couches respectées ; services interface + impl ; controllers sans logique métier ; DTOs records `*Request`/`*Response` ; entités non exposées ; gestion d'erreurs centralisée ; Streams/Optional.
2. **Entités JPA** : `@Entity` + `@Table` snake_case ; `@GeneratedValue(IDENTITY)` ; `@Column` explicites ; validators cohérents ; `LAZY` par défaut.
3. **Migrations** : Flyway uniquement (pas de `ddl-auto`) ; nommage `V{yyyymmdd}_{hhmiss}__{story}.sql` ; idempotence ; rollback fourni ; aucun script commité modifié.
4. **Frontend Angular** : standalone ; Signals ; `@if`/`@for`/`@switch` (pas de `*ngIf`/`*ngFor`) ; `inject()` ; typage strict (pas de `any`) ; kebab-case ; Reactive Forms ; services par domaine ; **aucun `*.spec.ts` créé hors contexte de test** ; i18n complet fr/en (aucun texte en dur) ; Tailwind/WebAwesome ; pipes natifs de formatage.
5. **PostgreSQL** : nommage (`pk_`/`fk_`/`idx_`/`uq_`/`chk_`) ; types adaptés ; index ; requêtes préparées.
6. **Git** : nommage de branche cohérent ; changement atomique (une feature/un fix).
7. **Documentation** : `architecture.md` mis à jour si la structure/API/table a changé.
8. **Statuer** : lister les écarts par sévérité, avec preuve et correction recommandée.

## Livrables

- **Verdict conformité** : conforme / écarts mineurs / écarts bloquants.
- **Liste des écarts** : convention enfreinte, preuve (fichier:ligne), sévérité, correction recommandée.
- **Documentation à synchroniser** le cas échéant.

## Critères de qualité

- Chaque écart est rattaché à une convention précise de `*-convention.md` avec preuve traçable.
- Les trois stacks et Git sont couverts selon le périmètre du changement.
- La mise à jour attendue d'`architecture.md` est vérifiée.
- Aucune modification de code.
