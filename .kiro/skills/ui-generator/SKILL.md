---
name: ui-generator
description: "
    Créer un composant ou une page Angular dans OBC Planner (standalone, Signals, WebAwesome, Tailwind, i18n, accessibilité). 
    À utiliser quand le besoin porte sur une interface : nouvel écran, composant réutilisable, formulaire, tableau, modale.
"
---

# Créer un composant UI

Produit un composant ou une page Angular conforme aux conventions frontend du projet : standalone, réactif via Signals, stylé en Tailwind + WebAwesome, internationalisé et accessible.

## Quand l'utiliser

- Pour créer une nouvelle page, un composant réutilisable, un formulaire, un tableau ou une modale.
- Pour intégrer une API existante côté interface.

## Références

Charger uniquement la section utile (grep) :

- `angular-convention.md` et `accessiblity-convention.md` (standalone, Signals, Signal Forms, i18n fr **et** en, WebAwesome + `CUSTOM_ELEMENTS_SCHEMA`, Tailwind, a11y, **pas de `*.spec.ts`**).
- `architecture.md` : arborescence `src/app/`, routes. `architecture-api.md` : seulement pour le DTO consommé.
- WebAwesome : `front-end/node_modules/@awesome.me/webawesome/dist/skills/webawesome/SKILL.md`, seulement pour le composant utilisé.
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
2. **Model + service** : vérifier/créer le model TypeScript aligné sur le DTO backend et le service HTTP du domaine (httpRessource, Observable, `catchError`).
3. **Composant** : standalone, `inject()`, état en Signals, template avec `@if`/`@for`, `CUSTOM_ELEMENTS_SCHEMA` si balises `<wa-*>`. Éviter CSS inline : Tailwind d'abord.
4. **Formulaires** : Signals Forms, `Validators`, messages d'erreur clairs, bouton de soumission désactivé tant que le formulaire est invalide.
5. **i18n** : aucune chaîne en dur ; ajouter les clés dans `public/assets/i18n/fr.json` **et** `en.json`, synchronisées.
6. **Accessibilité** : labels associés (`for`/`id`/`aria-label`), rôles ARIA, ordre DOM, contrastes, `tabindex` 0 ou -1 uniquement, gestion du focus sur modales/dropdowns, `<wa-tooltip>` plutôt que `title`.
7. **Vérifier** : procédure Build de `feature-builder` (frontend). Corriger les erreurs. **Ne pas créer de `*.spec.ts`.**

## Livrables

- Le(s) composant(s) `.ts` + `.html` (Tailwind), model et service si nécessaire.
- Les clés i18n ajoutées dans `fr.json` et `en.json`.
- La route ajoutée si c'est une page.
- Compte-rendu : fichiers créés/modifiés, résultat du build.

## Critères de qualité

- Standalone + Signals + syntaxe de contrôle `@if`/`@for` ; typage strict, pas de `any`.
- Aucune chaîne en dur : i18n fr/en synchronisés.
- Tailwind privilégié, WebAwesome utilisé correctement (`CUSTOM_ELEMENTS_SCHEMA`).
- Accessibilité respectée (labels, ARIA, focus, contrastes, tabindex).
- Aucun `*.spec.ts` créé ; le front builde sans erreur.
- Respect des règles écrites dans `angular-convention.md` et `accessiblity-convention.md`.
