---
title: Development Practices
inclusion: always
---

# Development Best Practices — OBC Planner

- Mettre à jour le fichier `docs/architecture.md` à chaque modification de l'architecture 
    - mise à jour de libraries (cf pom.xml / package.json)
    - modification de la structure des packages backend ou frontend
    - modification de la structure des tables
    - ajout ou modification des APIs
    - etc...

## Java / Spring Boot 4.1+

### Architecture générales
- Utiliser au maximum les annotations **Lombok** (`@RequiredArgsConstructor`, `@Data`, `@Builder`, `@Slf4j`, etc.)
- Préférer l'injection par constructeur (assurée par `@RequiredArgsConstructor`)
- Ne jamais injecter de dépendances via `@Autowired` sur les champs
- Respecter les 3 couches : **Controller → Service → Repository**
- Toujours utiliser des **interfaces + implémentations** pour les services / repositories
- Les controllers ne contiennent **aucune logique métier** — ils délèguent aux services
- Utiliser au maximum les **Streams** et les **Optional** pour éviter les boucles et les `null`
- Utiliser au maximum les annotations Spring, en cas de besoin plus complexe, créer un **Aspect** ou une **Annotation** dans `annotations/` et `aspects/`

### Entités JPA
- Les entités JPA doivent implémenter des validators (@Id, @Min, @Max, @NotNull, etc.) cohérent avec la base de données
- Toujours annoter avec `@Entity` + `@Table(name = "nom_snake_case")`
- Utiliser `@GeneratedValue(strategy = GenerationType.IDENTITY)` pour les IDs
- Nommer les colonnes explicitement avec `@Column(name = "nom_snake_case")`
- Éviter `FetchType.EAGER` — préférer `LAZY` et charger explicitement si besoin

### DTOs
- Utiliser des **DTOs** pour les échanges avec le frontend — jamais exposer les entités JPA directement
- Créer des DTOs distincts pour les requêtes (`*Request`) et les réponses (`*Response`)
- Utiliser des **records Java** pour les DTOs immuables

### Exceptions et sécurité
- Centraliser la gestion des erreurs avec @RestControllerAdvice et @ExceptionHandler
- Retourner des réponses d'erreur structurées avec un timestamp, un code et un message
- Logger les exceptions côté serveur, mais ne jamais exposer de stack trace au client en respectant le format suivant :
  - `[{timestamp}] {level} {class}.{method} - {message}`
- L'authentification se fait via JWT — pas de session côté serveur
- Les secrets sont stockés dans `secure-application.properties` exclu du Git
- Valider le token dans un filtre `OncePerRequestFilter`
- Ne jamais stocker de données sensibles dans le payload JWT
- Implémenter la sécurité au plus haut niveau possible (Configuration, Filter, Interceptor)

### Migrations base de données
- **Toujours** passer par Flyway pour modifier le schéma — jamais via `ddl-auto=update`
- Convention de nommage : `V{yyyymmdd}_{hhmiss}__{story}.sql` (ex: `V20260722_161600__S0002.sql`)
- Les scripts de migration doivent être **idempotents** — vérifier l'existence des tables/colonnes avant de les créer/supprimer et ne jamais supprimer de données existantes si existe des FK (favoriser les MERGE ou DELETE + INSERT selon le cas)
- Ne jamais modifier un script de migration déjà commité — créer un nouveau script pour corriger ou compléter
- Un script de montée de version doit être accompagné d'un script de descente (rollback)

---

## Angular 20+

### Conventions générales
- **Standalone components** uniquement — pas de NgModule
- **Signals** pour la gestion d'état local : `signal()`, `computed()`, `effect()`, `toSignal()`, `input()`, `output()`
- **`@if` / `@for` / `@switch` / `(model)`** (syntaxe de contrôle Angular 17+) — ne pas utiliser `*ngIf` / `*ngFor` / `*ngSwitch` / `[(ngModel)]`
- Utiliser `@ViewChild` et `@ViewChildren` pour accéder aux éléments du DOM uniquement si nécessaire — préférer les signaux et les bindings
- Typer **strictement** — éviter `any`
- Nommer les fichiers en kebab-case : `athlete-list.component.ts`
- Éviter au maximum le CSS inline ou les fichiers .css lors de la création de composants — préférer les classes Tailwind
- Ne pas créer de fichiers spec.ts
- Utiliser `@Injectable({ providedIn: 'root' })` pour les services

### Gestion des formulaires
- Préférer les **Reactive Forms** (`FormBuilder`, `FormGroup`, `FormControlName`) pour les formulaires et les filtres
- Ajouter des règles de validation sur les champs de formulaire avec `Validators` et des messages d'erreur clairs
- Bloquer les boutons de soumission tant que le formulaire est invalide

### Appels HTTP et services
- Séparer la logique dans des services — le composant gère uniquement l'état et les interactions UI
- Utiliser `inject()` plutôt que l'injection par constructeur pour les standalone components :
- Centraliser dans des services dédiés — un service par domaine métier
- Retourner des `Observable` et laisser le composant s'abonner via `pipe`, `subscribe` ou `catchError`
- Typer les réponses avec des interfaces (models) correspondant aux DTOs backend

### UI & Design
- Utiliser les composants WebAwesome et FontAwesome pour les éléments UI ([documentation complète](node_modules/@awesome.me/webawesome/dist/skills/webawesome/SKILL.md))
- Importer les composants nécessaires dans `main.ts` ou un fichier `webawesome.ts` dédié
- Déclarer `CUSTOM_ELEMENTS_SCHEMA` dans chaque composant utilisant des balises `<wa-*>`
- Utiliser Tailwind pour le layout et l'espacement
- Éviter d'utiliser `title` pour les tooltips et utiliser le composant `<wa-tooltip>` à la place

### Accessibilité
- Toujours associer les labels aux champs de formulaire avec `for` + `id` ou `aria-label` ou `label`
- Utiliser les balises et rôles ARIA appropriées
- Respecter l'ordre du DOM pour la navigation au clavier
- Utiliser des couleurs contrastées pour le texte et les éléments interactifs
- Les illustrations ou les couleurs ne doivent pas être les seuls moyens de transmettre l'information
- Ne jamais mettre de tabindex positif — uniquement 0 ou -1
- Lors de la fermeture d'une modale ou d'un dropdown, remettre le focus sur l'élément qui a ouvert la modale
- Dans le cadre d'un formulaire dynamique, ne jamais ajouter/supprimer des champs du formulaire s'ils se trouvent avant le champ actuellement focus — cela déplace le focus et perturbe l'utilisateur

### Internationalisation et formatage
- Toutes les chaînes visibles passent par `@ngx-translate` — aucun texte en dur en français
  - Dans les .html : `{{ 'key.code' | translate }}`
  - Dans les .ts : `this.#translationService.instant('key.code')`
- Fichiers de traduction dans `public/assets/i18n/{lang-LANG}.json` — un fichier par langue, ils doivent être synchronisés et complets
- Pour le formatage des chaines, dates et nombres, utiliser les pipes Angular natifs : 
  - Pour les nombres : `DecimalPipe` avec `this.#decimalPipe.transform(maValeur, format)` ou `{{ maValeur | number: format }}`
  - Pour les pourcentages : `PercentPipe` avec `this.#percentPipe.transform(maValeur)` ou `{{ maValeur | percent }}`
  - Pour les devises : `CurrencyPipe` avec `this.#currencyPipe.transform(maValeur, devise)` ou `{{ maValeur | currency: devise }}`
  - Pour les dates : `DatePipe` avec `this.#datePipe.transform(maDate, format)` ou `{{ maDate | date: format }}`
  - Pour le texte : 
    - `TitleCasePipe` avec `this.#titleCasePipe.transform(monTexte)` ou `{{ monTexte | titlecase }}`
    - `LowerCasePipe` avec `this.#lowerCasePipe.transform(monTexte)` ou `{{ monTexte | lowercase }}`
    - `UpperCasePipe` avec `this.#upperCasePipe.transform(monTexte)` ou `{{ monTexte | uppercase }}`

---

## PostgreSQL 17+

### Conventions de nommage
- Tables : `snake_case` au pluriel (`athletes`, `training_programs`)
- Colonnes : `snake_case` (`first_name`, `created_at`)
- Clés primaires : `pk_{table}` (`pk_athletes`)
- Clés étrangères : `fk_{table}_{num}` (`fk_athletes_1`)
- Index : `idx_{table}_{num)}` (`idx_athletes_1`)
- Contraintes : `uq_{table}_{num}` (`uq_athletes_1`), `chk_{table}_{num}` (`chk_athletes_1`)

### Bonnes pratiques
- Utiliser `TIMESTAMP`, `VARCHAR(n)`, `NUMERIC(p, s)`, `BOOLEAN` et `UUID` plutôt que `TEXT`, `FLOAT` ou `INT`
- Indexer systématiquement les colonnes utilisées dans les `WHERE`, `JOIN` et `ORDER BY`
- Ne jamais stocker de JSON sans raison valable — préférer des colonnes typées
- Utiliser `ENUM` PostgreSQL ou une table de référence pour les valeurs à choix limité
- Ajouter des contraintes de validation (`NOT NULL`, `UNIQUE`, `CHECK`) pour garantir l'intégrité des données
- Ajouter de la documentation sur les tables et les colonnes avec `COMMENT ON TABLE` et `COMMENT ON COLUMN`

### Requêtes SQL et performance
- Favoriser l'utilisation de JPA/Hibernate pour les requêtes simples — éviter les requêtes SQL brutes
- Éviter les requêtes dans des boucles côté backend — préférer les requêtes en batch, insertions ou mises à jour groupées ou retourner des listes plutôt que des requêtes individuelles multiples 
- Toujours utiliser des requêtes préparées avec des paramètres (`?`) pour éviter les injections SQL
- Préférer les `JOIN` explicites plutôt que les sous-requêtes imbriquées
- Éviter les `SELECT *` — sélectionner uniquement les colonnes nécessaires
- Utiliser des transactions (`@Transactional`) pour les opérations critiques ou multiples
- Utiliser des vues (standards ou matérialisées) pour les requêtes complexes ou coûteuses, et les rafraîchir périodiquement si nécessaires
- Éviter les DISTINCT, UNION ou GROUP BY inutiles — privilégier les index, les jointures appropriées ou UNION ALL si possible
- Favoriser l'utilisation de `EXISTS` plutôt que `IN` pour les sous-requêtes
- Paginer les listes avec `Pageable` côté Spring Data ou `LIMIT` / `OFFSET` côté SQL

---

## Git

### Structure et conventions
- Branches : `main`, `release/R{number}`, `feature/F{name}`, `story/S{name}`, `bugfix/B{name}`, `hotfix/H{name}`,
- Une PR ou un commit = une feature ou un fix — pas de commits fourre-tout
- Le message de commit doit respecter la convention suivante : 
```
{type}({scope}): {reference} - {title}

{body}

Ref: {reference}
```
avec :
- type = `feat` | `fix` | `docs` | `style` | `refactor` | `perf` | `security`
- scope = le nom du module ou de la fonctionnalité impactée
- title = une phrase courte décrivant le changement
- body = une description plus détaillée du changement
- reference = un lien vers la story Jira ou le ticket GitHub associé (généralement identique au nom de la branche)
