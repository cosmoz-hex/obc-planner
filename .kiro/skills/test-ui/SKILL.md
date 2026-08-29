---
name: test-ui
description: Mettre en place et écrire des tests d'interface end-to-end avec Playwright pour le frontend Angular d'OBC Planner. À utiliser pour couvrir un parcours UI ; les fichiers de test ne sont créés QUE dans ce cadre (le développeur n'en crée pas à la création d'un composant).
allowed-tools: Read, Write, Edit, Grep, Glob, CodeIntelligence, Shell
---

# Tests UI avec Playwright

Installe (si absent) et écrit des tests end-to-end Playwright pour couvrir des parcours utilisateur du frontend Angular. C'est le **seul** contexte où des fichiers de test frontend sont créés.

## État du projet (vérifié)

- `front-end/package.json` : Angular 20, **Playwright non installé** ; Karma/Jasmine présents (tests unitaires par défaut).
- Convention `*-convention.md` : le développeur ne crée **pas** de `*.spec.ts` à la création d'un composant. Les fichiers de test (Playwright `*.spec.ts` e2e ou équivalent) ne sont créés **que** par ce skill.

## Installation (si Playwright absent)

```bash
npm --prefix front-end install -D @playwright/test
npx --prefix front-end playwright install
```

Créer une configuration dédiée `front-end/playwright.config.ts` et un dossier de tests **séparé** des sources applicatives, ex. `front-end/e2e/`, avec fixtures/données dans `front-end/e2e/fixtures/`. Ne pas mélanger avec les specs Karma/Jasmine.

## Quand l'utiliser

- Pour couvrir un parcours UI (formulaire, tableau, modale, navigation) de bout en bout.
- Pour verrouiller une correction de bug frontend visible par l'utilisateur.

## Références obligatoires

- `.kiro/steering/product.md` — parcours et règles fonctionnelles à vérifier (athlètes, évaluations, programmation, référentiel).
- `.kiro/steering/*-convention.md` — accessibilité (sélecteurs par rôle/label), i18n (textes via ngx-translate), conventions front.
- `.kiro/steering/architecture.md` — routes et écrans (`app.routes.ts`, `pages/`, `components/`).
- Scénarios issus de `test-case` si disponibles.

## Contrat d'entrée

```
PARCOURS   : <parcours utilisateur à couvrir>
SCÉNARIOS  : <cas nominaux/limites/erreurs, idéalement de test-case>
DONNÉES    : <état initial requis, backend mocké ou lancé>
```

## Procédure

1. **Préparer l'environnement** : installer Playwright si absent ; configurer `baseURL` (dev `http://localhost:4200`), et la stratégie backend (mock des routes API via `page.route`, ou backend réel).
2. **Structurer** : tests dans `front-end/e2e/`, fixtures dans `front-end/e2e/fixtures/`, en dehors de `src/`.
3. **Écrire les parcours** : privilégier des **sélecteurs accessibles** (`getByRole`, `getByLabel`) cohérents avec les exigences d'accessibilité ; couvrir nominaux, limites, erreurs.
4. **i18n** : ne pas coder en dur des libellés fragiles ; cibler par rôle/`data-testid` plutôt que par texte traduit quand c'est pertinent.
5. **Isolation** : chaque test réinitialise son état (mock des réponses API ou données de test dédiées) pour être reproductible et indépendant de l'ordre.
6. **Exécuter** : `npx --prefix front-end playwright test`. Corriger jusqu'au vert. Vérifier que `npm --prefix front-end run build` reste OK.

## Livrables

- La config `playwright.config.ts` et le dossier `e2e/` (+ fixtures) si créés.
- Les tests e2e couvrant les parcours demandés.
- Le script npm ajouté si pertinent (ex. `"e2e": "playwright test"`).
- Résultat d'exécution et couverture des scénarios.

## Critères de qualité

- Fichiers de test isolés dans `front-end/e2e/`, jamais dans `src/` ; aucune spec créée hors de ce skill.
- Sélecteurs accessibles privilégiés ; tests reproductibles et indépendants de l'ordre.
- Cas nominaux, limites et erreurs couverts.
- Les tests passent ; le build front reste OK.
