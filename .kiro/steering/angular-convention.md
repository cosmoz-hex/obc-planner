---
title: Development Practices - Frontend
description: "Frontend development practices for Angular 20+"
inclusionMode: "fileMatch"
fileMatch:
  - "**/*.ts"
  - "**/*.html"
  - "**/*.css"
  - "**/*.scss"
  - "**/*.js"
  - "**/*.json"
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