---
name: feature-builder
description: Implémenter une évolution fonctionnelle complète dans OBC Planner (backend Spring Boot, frontend Angular, migration Flyway) en respectant les 3 couches, les DTOs, l'i18n et l'accessibilité. À utiliser quand des axes de développement sont définis et qu'il faut produire le code de bout en bout.
allowed-tools: Read, Write, Edit, Grep, Glob, CodeIntelligence, Shell
---

# Implémenter une évolution

Produit le code d'une évolution fonctionnelle de bout en bout, en respectant strictement les conventions du projet. Le skill lit d'abord le code existant pour s'y aligner, puis implémente, puis vérifie que ça compile.

## Quand l'utiliser

- Quand une évolution est cadrée (idéalement via `dev-planner`) et prête à être codée.
- Pour ajouter ou modifier une fonctionnalité touchant une ou plusieurs couches.

> Ce skill **orchestre** l'implémentation de bout en bout. Pour les briques spécialisées, il s'appuie sur (ou délègue à) les skills dédiés — chacun restant utilisable indépendamment :
> - [`sql-writer`](../sql-writer/SKILL.md) — requêtes SQL/JPA et scripts de migration Flyway.
> - [`api-builder`](../api-builder/SKILL.md) — endpoints REST (Controller → Service → Repository, DTOs, sécurité).
> - [`ui-generator`](../ui-generator/SKILL.md) — composants/pages Angular (standalone, Signals, i18n, accessibilité).

## Références obligatoires

- `.kiro/steering/*-convention.md` — **règle maîtresse** : Lombok, injection par constructeur, 3 couches, interfaces+impl, DTOs records, Flyway idempotent + rollback, Signals, standalone components, `@if`/`@for`, i18n, WebAwsome, Tailwind, accessibilité.
- `.kiro/steering/architecture.md` — où placer chaque élément (packages back, modules front, tables) ; **à mettre à jour** si la structure change.
- `.kiro/steering/product.md` — cohérence fonctionnelle et vocabulaire.
- `.kiro/steering/learning.md` — pièges déjà documentés à éviter.
- Code réel voisin (`back-end/src/main/java/...`, `front-end/src/app/...`) pour calquer le style local.

## Contrat d'entrée

```
AXES DE DÉVELOPPEMENT : <plan technique, idéalement issu de dev-planner>
CRITÈRES ACCEPTATION  : <critères vérifiables>
CONTRAINTES           : <optionnel>
```

Si les axes ne sont pas fournis, analyser l'existant et le besoin avant de coder.

## Procédure

1. **S'aligner** : lire le code voisin et les conventions pour reproduire le style (nommage, structure, patterns).
2. **Données d'abord** : si le schéma évolue, créer un script Flyway `V{yyyymmdd}_{hhmiss}__{story}.sql` idempotent, avec script de rollback associé. Ne jamais modifier un script déjà commité. Pour concevoir/optimiser les requêtes JPA/SQL ou le script de migration, s'appuyer sur [`sql-writer`](../sql-writer/SKILL.md).
3. **Backend** : entité JPA (validators cohérents avec la BD), repository (interface Spring Data), service (interface + impl sous `impl/`), DTOs `*Request`/`*Response` en records, controller délégant sans logique métier. Gestion d'erreurs centralisée, sécurité au bon niveau. Pour la création/évolution d'un endpoint REST, appliquer [`api-builder`](../api-builder/SKILL.md).
4. **Frontend** : model TypeScript aligné sur les DTOs, service HTTP par domaine, composant standalone avec Signals, formulaires réactifs si besoin, i18n (fr **et** en synchronisés), Tailwind + WebAwesome, accessibilité. **Ne pas créer de fichier `*.spec.ts`** (réservé au skill de test UI). Pour créer le composant/la page, appliquer [`ui-generator`](../ui-generator/SKILL.md).
5. **Vérifier** : compiler le backend (`mvn -q -f back-end/pom.xml compile`) et builder le front (`npm --prefix front-end run build`). Corriger toute erreur avant de rendre.
6. **Mettre à jour la doc** si la structure a changé (`architecture.md`) ou déléguer au skill de documentation.

## Livrables

- Le code implémenté (back + front + migration) conforme aux conventions.
- Les clés i18n ajoutées dans `fr` et `en`.
- Le script Flyway montée + rollback si le schéma a changé.
- Un compte-rendu : fichiers créés/modifiés, résultat de compilation/build, points restants (tests à écrire, doc à synchroniser).

## Critères de qualité

- 3 couches respectées ; controllers sans logique métier ; services en interface + impl.
- Lombok et injection par constructeur ; pas de `@Autowired` sur champ.
- DTOs (records) utilisés pour les échanges ; entités jamais exposées.
- Migrations via Flyway uniquement, idempotentes, avec rollback ; jamais `ddl-auto`.
- Front : standalone + Signals + `@if`/`@for`, i18n complet fr/en, accessibilité respectée, aucun `*.spec.ts` créé.
- Les briques déléguées (`sql-writer`, `api-builder`, `ui-generator`) respectent leurs propres critères de qualité, et l'ensemble reste cohérent de bout en bout.
- Le backend compile et le front builde sans erreur.
