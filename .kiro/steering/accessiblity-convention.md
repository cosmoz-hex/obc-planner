---
title: Development Practices - Accessibility
description: "Accessibility development practices for Angular 22+"
inclusionMode: "fileMatch"
fileMatch:
  - "**/*.ts"
  - "**/*.html"
  - "**/*.css"
  - "**/*.scss"
  - "**/*.js"
---

# Normes de Review — Accessibilité

## Structure HTML

- Utiliser les landmarks sémantiques : `<header>`, `<nav>`, `<main>`, `<footer>` (uniques dans la page)
- Hiérarchie des titres respectée : un seul `<h1>` par page, pas de niveau sauté
- Les titres doivent hiérarchiser l'information, pas servir de style
- Proposer un lien "Skip to content" (ancre vers `<main>`) en premier élément de la page
- Respecter l'ordre du DOM = ordre de lecture logique
- Ne jamais utiliser `tabindex > 0`
- Identifier l'élément actif avec `aria-current` (navigation, pagination, onglets)

## Couleur & Contraste

- La couleur ne doit jamais être le seul moyen de transmettre une information
- Ratios de contraste minimum :
  - Petit texte (< 18px ou < 14px gras) / fond : **4.5:1**
  - Grand texte (≥ 18px ou ≥ 14px gras) / fond : **3:1**
  - Bordure composant interactif / fond : **3:1**
  - Lien ou bouton / texte standard : **3:1**
  - État actif / état inactif : **3:1**
  - Couleurs adjacentes dans un graphique : **3:1**
- Respecter le mode contraste élevé (ne pas le désactiver ni surcharger les couleurs)

## Champs de saisie & Formulaires

- Tout champ doit avoir un `<label for="...">`, un attribut `label` ou `aria-label` / `aria-labelledby`
- Le `placeholder` ne remplace JAMAIS un label
- Champs obligatoires : identifiés visuellement + attribut `required` ou `aria-required="true"`
- Champs en erreur : `aria-invalid="true"` + message d'erreur lié via `aria-describedby`
- Grouper les champs liés avec `<fieldset>/<legend>` ou `role="group" aria-labelledby="..."`
- Messages d'erreur : significatifs, visibles, proches du champ
- Utiliser `autocomplete` pour les données personnelles

## Images & Icônes

- Une image ou icône ne doit jamais être le seul moyen de transmettre une information
- Images informatives : `alt` significatif (max 150 caractères)
- Images décoratives : `alt=""` + `role="presentation"` (ou `background-image` CSS)
- Icônes informatives : `role="img"` + `aria-label`
- Icônes décoratives (dans un bouton avec texte) : `aria-hidden="true"`
- SVG : `role="img"` + `<title>` + `aria-labelledby`
- Canvas/Graphiques : `role="img"` + `aria-label`, accompagner d'un tableau de données si possible
- Pas d'images contenant du texte (non accessible, non traduisible)

## Boutons & Liens

- Liens : `<a href="...">` — Boutons : `<button>`
- Chaque élément interactif doit avoir un libellé accessible, significatif et unique
- États visuels distincts pour hover et focus
- Alerter l'utilisateur en cas d'ouverture dans un nouvel onglet ou téléchargement
- Zone de clic suffisamment grande (min 48px sur mobile)
- Événements accessibles au clavier ; utiliser `click`/`mouseup` (pas `mousedown`)

## Tableaux

- `<table>` uniquement pour des données tabulaires (pas pour la mise en page)
- Titre via `<caption>` ou `aria-label`
- Utiliser `<thead>`, `<th scope="col|row">`, `headers` pour les tableaux complexes
- Sur petits écrans : linéariser les données (pas de scrollbar horizontale)

## Modales & Focus

- À l'ouverture : déplacer le focus dans la modale, piéger le focus à l'intérieur
- À la fermeture : remettre le focus sur l'élément déclencheur
- La modale peut avoir son propre `<h1>` (traitée comme une page)

## Contenu dynamique

- Pas de modification automatique de contenu, focus ou contexte sans action utilisateur
- Chargement dynamique (scroll infini) : contenu en dernier élément, ou bouton "Charger plus"
- Avertir l'utilisateur en cas de chargement long
- `aria-live` pour les messages temporaires (erreurs, confirmations)
  - Conteneur présent mais vide au chargement, rempli lors de l'annonce, vidé ensuite
  - Ne pas abuser des `aria-live` (perturbent la lecture)

## Tabindex & Navigation clavier

- `tabindex="0"` : rendre un élément focusable dans l'ordre naturel du DOM
- `tabindex="-1"` : focusable programmatiquement uniquement (ou via flèches dans un groupe)
- Navigation au clavier : TAB entre composants, flèches au sein d'un groupe (toolbar, radio, etc.)

## ARIA — Principes

- Préférer les attributs HTML natifs (`required`, `alt`, `checked`, `disabled`) aux ARIA
- Pour chaque composant, vérifier : rôle correct, libellé accessible, états annoncés
- Ne pas utiliser ARIA pour compenser un HTML mal structuré
- Texte masqué accessible (classe `visually-hidden`) quand une information visuelle n'a pas d'équivalent textuel

## Typographie

- Interligne entre 1.5 et 2, espacement paragraphes ≥ 1.5× l'interligne
- Max 80 caractères par ligne
- Ne pas justifier le texte
- Unités CSS en `em` ou `rem` (support du zoom texte jusqu'à 200%)