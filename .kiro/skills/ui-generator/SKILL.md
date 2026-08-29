---
name: ui-generator
description: Créer un composant ou une page Angular 20 dans OBC Planner (standalone, Signals, WebAwesome, Tailwind, i18n, accessibilité). À utiliser quand le besoin porte sur une interface : nouvel écran, composant réutilisable, formulaire, tableau, modale.
allowed-tools: Read, Write, Edit, Grep, Glob, CodeIntelligence, Shell
---

# Créer un composant UI

Produit un composant ou une page Angular conforme aux conventions frontend du projet : standalone, réactif via Signals, stylé en Tailwind + WebAwesome, internationalisé et accessible.

## Quand l'utiliser

- Pour créer une nouvelle page, un composant réutilisable, un formulaire, un tableau ou une modale.
- Pour intégrer une API existante côté interface.

## Références obligatoires

- `.kiro/steering/angular-convention.md` — section Angular : standalone uniquement, Signals (`signal`/`computed`/`effect`/`input`/`output`/`toSignal`), `@if`/`@for`/`@switch`, `inject()`, typage strict, kebab-case, **pas de `*.spec.ts` à la création**, Reactive Forms, services par domaine, i18n ngx-translate (fr **et** en), WebAwesome + `CUSTOM_ELEMENTS_SCHEMA`, Tailwind, accessibilité, pipes natifs pour le formatage.
- `.kiro/steering/architecture.md` — arborescence `src/app/` (`components/`, `pages/`, `services/`, `models/`), routes.
- `.kiro/steering/product.md` — vocabulaire et attentes fonctionnelles.
- WebAwesome : `front-end/node_modules/@awesome.me/webawesome/dist/skills/webawesome/SKILL.md` et `webawesome-design/SKILL.md`.
- Composants existants (`front-end/src/app/pages/**`, `components/**`) pour calquer le style.

## Contrat d'entrée

```
TYPE UI        : <page / composant réutilisable / formulaire / tableau / modale>
FONCTION       : <ce que l'écran doit permettre>
DONNÉES        : <API/model consommés ou produits>
EMPLACEMENT    : <optionnel : route ou dossier cible>
```

## Procédure

1. **Situer** le composant dans l'arborescence (`pages/` pour un écran routé, `components/` pour du réutilisable) et, si page, dans `app.routes.ts`.
2. **Model + service** : vérifier/créer le model TypeScript aligné sur le DTO backend et le service HTTP du domaine (Observable, `catchError`).
3. **Composant** : standalone, `inject()`, état en Signals, template avec `@if`/`@for`, `CUSTOM_ELEMENTS_SCHEMA` si balises `<wa-*>`. Éviter CSS inline : Tailwind d'abord.
4. **Formulaires** : Reactive Forms, `Validators`, messages d'erreur clairs, bouton de soumission désactivé tant que le formulaire est invalide.
5. **i18n** : aucune chaîne en dur ; ajouter les clés dans `public/assets/i18n/fr.json` **et** `en.json`, synchronisées.
6. **Accessibilité** : labels associés (`for`/`id`/`aria-label`), rôles ARIA, ordre DOM, contrastes, `tabindex` 0 ou -1 uniquement, gestion du focus sur modales/dropdowns, `<wa-tooltip>` plutôt que `title`.
7. **Vérifier** : `npm --prefix front-end run build`. Corriger les erreurs. **Ne pas créer de `*.spec.ts`.**

## Livrables

- Le(s) composant(s) `.ts` + `.html` (Tailwind), model et service si nécessaires.
- Les clés i18n ajoutées dans `fr.json` et `en.json`.
- La route ajoutée si c'est une page.
- Compte-rendu : fichiers créés/modifiés, résultat du build, recommandation de test UI (skill `test-ui`).

## Critères de qualité

- Standalone + Signals + syntaxe de contrôle `@if`/`@for` ; typage strict, pas de `any`.
- Aucune chaîne en dur : i18n fr/en synchronisés.
- Tailwind privilégié, WebAwesome utilisé correctement (`CUSTOM_ELEMENTS_SCHEMA`).
- Accessibilité respectée (labels, ARIA, focus, contrastes, tabindex).
- Aucun `*.spec.ts` créé ; le front builde sans erreur.
