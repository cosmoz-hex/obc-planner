---
title: Learning
inclusion: always
---

# Apprentissages et retours d'expérience

Ce fichier est un journal de connaissances acquises au fil du développement.
Kiro doit y consigner toute leçon apprise suite à une correction demandée par l'utilisateur, une erreur de jugement, ou un écart par rapport aux bonnes pratiques du projet.

## Règles d'utilisation

- **Quand écrire ici ?** À chaque fois qu'une correction est demandée sur un choix technique ou un pattern proposé par Kiro et qui s'avère incorrect ou non conforme aux pratiques du projet.
- **Format** : une entrée courte, factuelle, avec le contexte et la bonne pratique retenue.
- **Objectif** : ne jamais reproduire la même erreur deux fois.

---

## Leçons apprises

### 2026-08-18 — Exercices composés squat + box jump : rep_number
- **Contexte** : Pour un exercice "Flexion Nuque Excentrique + Box Jump" avec format `4 x (4 + 8)`.
- **Erreur initiale** : Additionner les reps squat + box jump dans `rep_number` (4+8=12).
- **Bonne pratique** : `rep_number` ne compte que les reps à la barre (squat). Les box jumps sont sans barre, donc `rep_number=4`. On additionne uniquement quand les 2 mouvements sont à la barre (ex: front + back squat).

### 2026-08-18 — Notation `n (1 + 1)` dans les protocoles
- **Contexte** : Le PDF note `4 x 2 (1 + 1)` pour un exercice composé (tirage haut + tirage haut suspension).
- **Erreur initiale** : Interpréter `2 (1 + 1)` comme 2 reps au lieu de `2 × (1+1) = 4` reps.
- **Bonne pratique** : `n (1 + 1)` est une notation mathématique. `2 (1 + 1) = 4` reps totales à la barre. `rep_label = '2 (1 + 1)'` pour l'affichage, `rep_number = 4` pour le volume réel.

### 2026-08-30 — Toujours annoncer l'Agent/skill et suivre la pipeline de dev
- **Contexte** : Sur plusieurs demandes (migration, refactor UI), Kiro a agi « en direct » sans nommer l'Agent incarné ni le skill appliqué, ni indiquer les étapes de pipeline sautées.
- **Erreur initiale** : Exécuter la tâche sans traçabilité, privant l'utilisateur de la visibilité sur ce qui est fait et sur ce qui pourrait manquer.
- **Bonne pratique** : À chaque demande impliquant du code, préciser en tête et à chaque bascule : l'Agent (Analyste/Développeur/Reviewer/Documentaliste), le(s) skill(s) appliqué(s), les étapes volontairement sautées + justification (parcimonie), et les boucles de feedback. Pour une simple question de compréhension, l'indiquer explicitement comme « hors pipeline ». Ce comportement doit être automatique, sans que l'utilisateur ait à le redemander dans son prompt.

### 2026-09-01 — `@Data` sur les entités JPA + garde-fou sur les relations
- **Contexte** : Simplification des entités (`Athlete`, `EvalSummary`) avec `@Data` à la place de `@Getter`/`@Setter`.
- **Point d'attention** : `@Data` génère `equals`/`hashCode`/`toString` sur **tous** les champs. Sur une relation lazy (`@ManyToOne`), cela peut déclencher un chargement inattendu ou une récursion infinie.
- **Bonne pratique** : Utiliser `@Data` sur les entités ; sur les champs de **relation**, ajouter `@EqualsAndHashCode.Exclude` et `@ToString.Exclude`. Entité sans relation (`Athlete`) : `@Data` seul. Entité avec relation (`EvalSummary.athlete`) : `@Data` + exclusions.


### 2026-09-02 — Web components à état interne : property binding, pas `[attr.*]`
- **Contexte** : `<wa-pagination>` paginait de travers (clic « suivant » sans effet, puis sauts/retours 1 → 1 → 2 → 1).
- **Cause** : binding via `[attr.page]`/`[attr.total]`/`[attr.page-size]` alors que le composant gère son état via ses **propriétés JS** ; la réécriture de l'attribut au re-render entrait en conflit avec la propriété interne (désynchronisation).
- **Bonne pratique** : pour un web component qui maintient un état interne (pagination, etc.), utiliser le **property binding** (`[page]`, `[total]`, `[pageSize]`) et non `[attr.*]`. Réserver `[attr.*]` aux attributs sans propriété JS correspondante ou purement déclaratifs (ex. `label`, `placeholder`).


### 2026-09-05 — `httpResource.value()` retombe à `undefined` pendant le fetch → total transitoire à 0
- **Contexte** : dans le data-grid, changer de page rechargeait les données puis renvoyait aussitôt à la page 1. En commentant le `set` sur `page` (donc sans rechargement), la navigation fonctionnait.
- **Cause** : `<wa-pagination>` recevait `[total]="totalElements()"`. Or `totalElements` dérive de `httpResource.value()`, qui repasse à `undefined` durant chaque fetch → `totalElements` = 0 transitoirement. Avec `total = 0`, `<wa-pagination>` recalcule 1 seule page, reclampe sa page interne à 1 et ré-émet un `wa-page-change` parasite qui ramène à la première page. (Régression introduite en supprimant un `linkedSignal` qui figeait la dernière page.)
- **Bonne pratique** : quand une valeur pilote l'état interne d'un web component (ici le `total` de `<wa-pagination>`), ne jamais lui exposer un état transitoire d'une ressource en cours de chargement. Figer la dernière valeur connue pendant le chargement via un `linkedSignal` s'appuyant sur `loading()` : `computation: (curr, previous) => curr.loading ? (previous?.value ?? curr.total) : curr.total`. Porter la correction **dans le composant réutilisable** (data-grid) plutôt que dans chaque écran, pour ne pas répéter l'implémentation.


### 2026-09-06 — Désactiver la pagination : `size=0` doit être intercepté au controller
- **Contexte** : data-grid avec un attribut `pageable=false` envoyant `size=0` au backend pour « retourner tous les résultats ».
- **Erreur initiale** : détecter `size=0` dans le service via `pageable.getPageSize() == 0`. Spring Data **refuse** une taille de page nulle : le `PageableHandlerMethodArgumentResolver` remplace `0` par la taille par défaut avant que le service ne soit appelé — la condition ne se déclenche jamais.
- **Bonne pratique** : lire `size` en `@RequestParam(required = false) Integer size` dans le **controller** et, si `size == 0`, transmettre `Pageable.unpaged(pageable.getSort())` (conserve le tri). Côté service, gérer `pageable.isUnpaged()` dans le sanitize du tri (ne jamais appeler `getPageSize()`/`getPageNumber()` sur un unpaged → `UnsupportedOperationException`). `PageResponse.from` renvoie alors `totalPages=1` et `size` = nombre total d'éléments.



### 2026-09-06 — Vérification build : réutiliser la contrainte d'unicité existante + fallback quand le shell ne peut pas lancer JDK/npm
- **Contexte** : création de l'écran référentiel Archétype (CRUD complet, table `ref_archetypes`). Deux points de vigilance rencontrés.
- **Point 1 — ne pas dupliquer une contrainte déjà en base** : avant de créer une migration Flyway pour l'unicité de la combinaison de profils, vérifier le DDL existant. Ici `uq_ref_archetypes_1 UNIQUE (strength_speed, technique, endurance)` et les 4 `CHECK` existaient déjà dans le script d'init. Bonne pratique : s'appuyer sur la contrainte existante et n'ajouter côté service qu'une **validation applicative** (`existsBy...` + `existsBy...AndRefArchetypeIdNot` pour l'update) qui renvoie un `BusinessRuleException` (409) lisible, plutôt qu'une nouvelle migration ou une erreur SQL brute exposée.
- **Point 2 — shell sandbox incapable de spawner la JVM/les workers de build** : `mvn`/`java.exe` (même en chemin absolu), `mvnw.cmd` et `npm` renvoyaient `exit 1` sans sortie ni fichier de redirection, alors que `echo` et `node` fonctionnaient. Le sandbox bloque le lancement de la JVM et des workers esbuild/npm. Bonne pratique : ne pas boucler sur la commande de build ; basculer sur des **vérifications alternatives** réalisables (validation JSON des i18n via `node -e`, comparaison des clés fr/en pour la synchro, revue statique croisée des APIs des composants/directives réutilisés et alignement strict sur un pattern déjà compilé dans le projet — ici l'écran athlètes), puis **documenter explicitement** que la compilation back (Maven/JDK 25) et le build front (Angular) n'ont pas pu être exécutés dans cet environnement.

### 2026-09-09 — `DatePipe` ne suit pas automatiquement la langue ngx-translate
- **Contexte** : les écrans Athlètes et Évaluations changeaient bien leurs libellés avec ngx-translate, mais les dates restaient formatées selon la locale Angular initiale (`en-US`).
- **Erreur initiale** : appeler `DatePipe.transform(...)` sans locale explicite en supposant que `translate.use(lang)` ou l'attribut `<html lang>` modifierait `LOCALE_ID`. `LOCALE_ID` est injecté statiquement et ne réagit pas aux changements de langue.
- **Bonne pratique** : enregistrer les données de locale nécessaires avec `registerLocaleData`, exposer la langue ngx-translate active sous forme de Signal partagé et centraliser le formatage dans un `LocalizedDatePipe`. Pour les formatters impératifs, faire dépendre le `computed` qui construit les colonnes du signal de locale exposé par le pipe afin que les formatters soient recréés au changement de langue.

### 2026-10-17 — Notifications d'erreur : utiliser `wa-toast`, pas `wa-callout`
- **Contexte** : message d'erreur affiché via `<wa-callout>` (variant danger) lors de l'échec de suppression d'une évaluation.
- **Erreur initiale** : utiliser `wa-callout` pour une notification transitoire. Un `wa-callout` ne peut être ni fermé par l'utilisateur ni auto-disparaître ; il reste affiché indéfiniment.
- **Bonne pratique** : pour une notification non bloquante (erreur ponctuelle, succès, info), utiliser `<wa-toast>` (disponible dans WebAwesome Core depuis 3.11.0 ; projet en 3.12.0). Pattern : un seul `<wa-toast #errorToast></wa-toast>` dans le template, `viewChild<ElementRef<WaToast>>('errorToast')` côté composant, puis `errorToast()?.nativeElement.create(message, { variant: 'danger', icon: 'triangle-exclamation' })`. Le message doit être **déjà traduit** (`translate.instant(...)`) et passé en **texte brut** (ne pas activer `allowHtml` → pas de XSS). Auto-dismiss par défaut à 5 s (`duration: 0` pour garder jusqu'à fermeture manuelle), pause au survol/focus, annonce ARIA gérée nativement. Réserver `wa-callout` aux messages inline **permanents**.

### 2026-10-17 — Lancer le build backend : `back-end/mvnw.cmd` + capture du code retour via `cmd /c`
- **Contexte** : la leçon du 2026-09-06 (Point 2) concluait que le sandbox ne pouvait pas spawner la JVM/npm (`exit 1` sans sortie). En réalité, le problème était surtout la **capture de la sortie** : les commandes rendaient un `exit 1` vide y compris pour `mvn -version`, `where`, `dir`.
- **Erreur initiale** : conclure trop vite à l'impossibilité de compiler et se rabattre sur des vérifications alternatives.
- **Bonne pratique** :
  - **Emplacement de Maven** : le projet embarque le wrapper `back-end/mvnw.cmd` (et `back-end/mvnw`). Compiler le backend via ce wrapper, exécuté depuis le dossier `back-end/` : préférer le wrapper à un `mvn` global (non garanti dans le PATH du sandbox).
  - **Capturer le résultat** : la sortie des builds n'est pas restituée directement par le shell. Rediriger vers un fichier et récupérer le code retour explicitement : `cmd /c "mvnw.cmd -q compile > build-out.txt 2>&1 & echo DONE_%ERRORLEVEL%"` (idem front : `cmd /c "npm run build > build-out.txt 2>&1 & echo DONE_%ERRORLEVEL%"`). `DONE_0` = succès. Nettoyer ensuite `build-out.txt` (son encodage n'est pas forcément UTF-8, d'où une lecture illisible — s'appuyer sur le code retour, pas sur le contenu). La compilation back (JDK 25 / Spring Boot) et le build front (Angular) sont donc bien **vérifiables** dans cet environnement.
