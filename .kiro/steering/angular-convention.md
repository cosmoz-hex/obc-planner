---
title: Development Practices - Frontend
description: "Frontend development practices for Angular 22+"
inclusionMode: "fileMatch"
fileMatch:
  - "**/*.ts"
  - "**/*.html"
  - "**/*.css"
  - "**/*.scss"
  - "**/*.js"
  - "**/*.json"
---

## Angular 22+

### Conventions générales
- **Standalone components** uniquement — pas de NgModule
- **Signals** pour la gestion d'état local : `signal()`, `computed()`, `linkedSignal()`, `effect()`, `toSignal()`, `input()`, `output()`, `model()`
  - `computed()` : état dérivé **en lecture seule**
  - `linkedSignal()` : état dérivé **réinscriptible** — se recalcule quand sa source change mais reste modifiable par l'utilisateur (ex. sélection par défaut recalculée quand la liste change, tout en restant écrasable)
- **`@if` / `@for` / `@switch` / `(model)`** (syntaxe de contrôle Angular 17+) — ne pas utiliser `*ngIf` / `*ngFor` / `*ngSwitch` / `[(ngModel)]`
- Pour accéder aux éléments du DOM, préférer les fonctions signal **`viewChild()` / `viewChildren()`** (et `contentChild()` / `contentChildren()`) plutôt que les décorateurs `@ViewChild` / `@ViewChildren` — et uniquement si un binding ne suffit pas
- Typer **strictement** — éviter `any`
- Nommer les fichiers en kebab-case : `athlete-list.component.ts`
- Éviter au maximum le CSS inline ou les fichiers .css lors de la création de composants — préférer les classes Tailwind
- Ne pas créer de fichiers spec.ts
- Utiliser le décorateur **`@Service()`** pour les services applicatifs standard (raccourci ergonomique et tree-shakable de `@Injectable({ providedIn: 'root' })`). Réserver `@Injectable()` aux cas avancés (scope non-root, options d'injection spécifiques) ; il reste supporté

### Gestion des formulaires
- Utiliser les **Signal Forms** (`@angular/forms/signals`)
- **Form model** : un `signal()` typé, source de vérité. Créer le formulaire avec `form(model, schemaFn?)`. Accès/écriture par champ : `monForm.email().value()` (lecture) et `.value.set(...)` (écriture).
- **Validateurs intégrés** (dans la fonction de schéma) : `required`, `email`, `min`, `max`, `minLength`, `maxLength`, `pattern`, `minDate`, `maxDate`.
- **Condition** : option `when` sur un validateur pour l'activer conditionnellement.
- **Validateur spécifique** : `validate(path, ctx => …)` — retourne un objet `{ kind, message }` en cas d'erreur, `undefined` sinon (`ctx` expose `value()`, `valueOf(path)`).
- **Remplacer l'erreur** : option `error` sur un validateur pour fournir l'objet d'erreur complet.
- **Fonctions d'état** (dans le schéma) : `disabled`, `hidden`, `readonly` (avec option `when`). `hidden` ne masque pas le DOM — le retirer de la vue avec `@if`.
- **Réutilisation** : `schema<T>()` pour définir un jeu de règles, appliqué via `apply` / `applyEach` / `applyWhen`.
- **Template** : `[formField]` pour lier un champ, `[formRoot]` sur le `<form>`. Importer `FormField` et `FormRoot`.

**Exemple minimal :**
```ts
import {form, required, email, minLength, validate} from '@angular/forms/signals';

loginModel = signal({email: '', password: ''});

loginForm = form(this.loginModel, (model) => {
  required(model.email, {message: 'Email requis'});
  email(model.email);
  minLength(model.password, 8, {message: 'Au moins 8 caractères'});
});
```

### Appels HTTP et services
- Séparer la logique dans des services — le composant gère uniquement l'état et les interactions UI
- Utiliser `inject()` plutôt que l'injection par constructeur
- Centraliser dans des services dédiés — un service par domaine métier
- Pour la **récupération de données réactive**, préférer **`httpResource()` / `resource()`** : le statut et la réponse sont exposés en signals, ce qui limite les `Observable` et les `subscribe` manuels et s'intègre naturellement avec `computed`/`effect`/`linkedSignal`
- Garder **`HttpClient` + RxJS** pour les cas non couverts (flux complexes, opérations impératives) **ou lorsqu'une interface tierce impose un `Observable`** (ex. `TranslateLoader` de ngx-translate)
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