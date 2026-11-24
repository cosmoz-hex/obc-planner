---
title: Learning
inclusion: manual
---

# Apprentissages et retours d'expérience

Journal des leçons issues d'une correction demandée, d'une erreur de jugement ou d'un écart aux bonnes pratiques. Référencé explicitement par le développeur et l'orchestrator (inclusion manuelle).

## Règles d'utilisation

- **Quand écrire ici ?** Après une correction sur un choix technique ou un pattern proposé par Kiro, incorrect ou non conforme au projet.
- **Format** : titre `### AAAA-MM-JJ — sujet`, puis 2 à 4 lignes max (règle à retenir + cause en une phrase). Le détail éventuel va dans `.kiro/archive/learning-full.md`.
- **Rangement** : dans la section thématique correspondante.
- **Objectif** : ne jamais reproduire la même erreur.

---

## Process / Build

### 2026-08-30 — Annoncer Agent/skill et suivre la pipeline
Pour toute demande impliquant du code, indiquer en tête et à chaque bascule : Agent (Analyste/Développeur/Reviewer/Documentaliste), skill(s), étapes sautées + justification, boucles de feedback. Question de compréhension = « hors pipeline ». Automatique, sans que l'utilisateur le redemande.

### 2026-10-17 / 2026-11-07 — Build backend et frontend (sandbox)
- Back : depuis `back-end/`, `cmd /c ".\mvnw.cmd -q compile > build-out.txt 2>&1 & echo DONE_%ERRORLEVEL%"` (le `.\` est obligatoire). Front : `cmd /c "npm run build > build-out.txt 2>&1 & echo DONE_%ERRORLEVEL%"`.
- `DONE_x` est l'ERRORLEVEL de `echo`, pas du build : **toujours lire `build-out.txt`** (`[ERROR]`, `release version`), puis le supprimer (encodage non UTF-8).
- Vérifier le JDK (`java -version`, `Get-ChildItem 'C:\Program Files\Java'`) : le projet cible Java 25 ; si absent, compilation non exécutable → le documenter et faire une revue statique, sans modifier `pom.xml`.
- Ne pas conclure trop vite à l'impossibilité de builder (leçon 2026-09-06 périmée).

## Backend / Java

### 2026-09-01 — `@Data` sur entités JPA
`@Data` sur les entités ; sur les relations (`@ManyToOne`/`@OneToMany`) ajouter `@EqualsAndHashCode.Exclude` + `@ToString.Exclude` (sinon chargement lazy / récursion). Entité sans relation : `@Data` seul.

### 2026-09-06 — Désactiver la pagination (`size=0`)
Spring remplace `size=0` par la taille par défaut avant le service. Lire `@RequestParam(required = false) Integer size` dans le **controller** et passer `Pageable.unpaged(pageable.getSort())`. Service : gérer `pageable.isUnpaged()` (jamais `getPageSize()`/`getPageNumber()` sur un unpaged). `PageResponse.from` → `totalPages=1`.

### 2026-09-06 — Unicité : réutiliser la contrainte existante
Avant une migration, vérifier le DDL existant (ex. `uq_ref_archetypes_1`). Ajouter côté service une validation applicative (`existsBy...`, `existsBy...AndRefArchetypeIdNot` en update) → `BusinessRuleException` (409) lisible, pas d'erreur SQL brute.

## Base de données / SQL

### 2026-11-07 — Seed `INSERT...SELECT...UNION ALL` : typer les `NULL`
Si toutes les branches d'un bloc ont `NULL` sur une colonne numérique, PostgreSQL infère `text` (SQLSTATE 42804). Écrire `NULL::numeric` (idem `::integer`, `::date`). Inutile pour varchar/text.

### 2026-11-08 — Colonnes cibles du moteur : dimensionner pour les valeurs composées
Borne haute = somme des longueurs max des sources + séparateurs (ex. `exercice_name` = 2×100 + « + » → 255 ; `rep_number` combiné → VARCHAR(50)). Aligner `@Column(length)` et migration. Vérifier les autres colonnes des mêmes tables (NUMERIC(6,2) des charges : marge confortable). Pattern : migration `V{ts}` idempotente `DO $$ ... character_maximum_length < N ... ALTER COLUMN TYPE`, COMMENT à jour, rollback symétrique dans `db/rollback/`.

## Frontend Angular / WebAwesome

### 2026-09-02 — Web component à état interne : property binding
`<wa-pagination>` etc. : `[page]`, `[total]`, `[pageSize]`, pas `[attr.*]` (désynchronisation avec la propriété JS). `[attr.*]` réservé aux attributs déclaratifs (`label`, `placeholder`).

### 2026-09-05 — `httpResource.value()` transitoire → total à 0
`value()` repasse à `undefined` pendant le fetch, `total=0` fait reclamper `<wa-pagination>` à la page 1. Figer la dernière valeur via `linkedSignal` sur `loading()` : `computation: (curr, previous) => curr.loading ? (previous?.value ?? curr.total) : curr.total`. Corriger dans le composant réutilisable (data-grid).

### 2026-09-09 — `DatePipe` ne suit pas ngx-translate
`LOCALE_ID` est statique. Utiliser `registerLocaleData` + signal de langue partagé + `LocalizedDatePipe` ; pour les formatters impératifs, faire dépendre le `computed` des colonnes du signal de locale.

### 2026-10-17 — Notifications : `wa-toast`, pas `wa-callout`
`wa-callout` ne se ferme pas. Un `<wa-toast #errorToast>`, `viewChild<ElementRef<WaToast>>`, `errorToast()?.nativeElement.create(message, { variant: 'danger', icon: 'triangle-exclamation' })`, message déjà traduit, texte brut (pas `allowHtml`). `wa-callout` réservé aux messages inline permanents.

### 2026-11-07 — `wa-select` : `value` en string
Les options exposent `value` en attribut (string) : lier `[value]="x().toString()"` (property binding) ; convertir en `Number(...)` dans `(change)`. Modèle : `athlete-form-dialog.component.html`.

### 2026-11-08 — Pipe standalone via `inject()` : `providers`
Un pipe standalone injecté impérativement doit être dans `providers: [LocalizedDatePipe]` du `@Component` (dans `imports` s'il est utilisé en template). Sinon `NG0201` au **runtime seulement** (build vert). Modèle : `athletes.component.ts`.

## Moteur de génération / Protocoles

### 2026-08-18 — Squat + box jump : `rep_number`
`rep_number` ne compte que les reps à la barre (`4 x (4 + 8)` squat+box jump → 4). On additionne seulement si les deux mouvements sont à la barre.

### 2026-08-18 — Notation `n (1 + 1)`
Notation mathématique : `2 (1 + 1) = 4` reps. `rep_label = '2 (1 + 1)'` pour l'affichage, `rep_number = 4` pour le volume.

---

Détail historique : .kiro/archive/learning-full.md
