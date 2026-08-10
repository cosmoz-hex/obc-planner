# Skill : Requirements Analysis

**Utilisateur** : @analyste

## Description
Extrait et structure les besoins depuis la demande utilisateur, `/docs`, et `.kiro/steering`. Identifie les ambiguïtés et prépare un document de besoins clair pour @architecte.

## Usage
Charge ce skill quand tu dois analyser une demande utilisateur et préparer le contexte pour l'architecte.

## Processus

### 1. Classification de la demande

Identifier le type de tâche :

```typescript
function classifyRequest(userRequest: string): TaskType {
  const keywords = {
    feature: ["ajouter", "créer", "nouveau", "implémenter"],
    bugfix: ["corriger", "bug", "erreur", "problème", "fix"],
    refactor: ["refactorer", "améliorer", "restructurer", "nettoyer"],
    enhancement: ["améliorer", "optimiser", "enrichir", "compléter"]
  };
  
  // Analyser présence mots-clés et contexte
  // Retourner le type le plus probable
}
```

### 2. Consultation documentation

Lire les fichiers pertinents selon le type de tâche :

#### Toujours lire :
- `.kiro/steering/dev-practices.md` → contraintes de code (déjà en contexte)
- `.kiro/steering/product.md` → règles métier (déjà en contexte)

#### Si besoin de contexte technique (exemples de code existant) :
- `/docs/architecture-complete.md` → structure packages, dépendances
- `/docs/database-schema.md` → tables existantes
- Code existant pertinent pour montrer les patterns

**Note** : Le contexte technique est optionnel. L'analyste reste fonctionnel, mais peut consulter le code pour mieux comprendre le domaine métier.

### 3. Identification des modules impactés (point de vue fonctionnel)

```typescript
interface ImpactedModules {
  backend: {
    packages: string[];        // ex: ["services", "controllers"]
    services: string[];        // ex: ["AthleteService", "EvaluationService"]
    new_endpoints: boolean;
  };
  frontend: {
    modules: string[];         // ex: ["components", "services"]
    components: string[];      // ex: ["athlete-list", "evaluation-form"]
    new_routes: boolean;
  };
  database: {
    tables: string[];          // ex: ["athletes", "evaluations"]
    new_tables: boolean;
    new_columns: boolean;
    new_indexes: boolean;
  };
}
```

### 4. Extraction des contraintes

#### Contraintes métier (depuis product.md)
- Règles de calcul (ex: profils, archétypes)
- Validations métier (ex: athlète doit avoir évaluation avant plan)
- Workflows utilisateur

#### Contraintes techniques (depuis dev-practices.md)
- Backend : Lombok, injection constructeur, DTOs obligatoires
- Frontend : Standalone, signals, i18n obligatoire, Tailwind uniquement
- BDD : Migrations Flyway, nommage snake_case, idempotence

### 5. Identification des ambiguïtés

Questions à poser si informations manquantes :

```typescript
interface Clarification {
  question: string;
  context: string;
  impact: "bloquant" | "important" | "mineur";
}

// Exemples de questions
const clarifications: Clarification[] = [
  {
    question: "Le profil psychologique doit-il être obligatoire ou optionnel ?",
    context: "Pour la validation côté backend et l'affichage côté frontend",
    impact: "bloquant"
  },
  {
    question: "Faut-il pouvoir modifier un profil après création ?",
    context: "Impact sur l'API (endpoint PUT nécessaire ?)",
    impact: "important"
  },
  {
    question: "Les scores psychologiques sont notés sur quelle échelle ?",
    context: "Pour la validation (@Min, @Max) et l'UI (slider, input)",
    impact: "important"
  }
];
```

**Grouper max 3 questions** et utiliser `ask_question` :

```typescript
ask_question({
  question: `Quelques précisions pour bien analyser ta demande :

1. Le profil psychologique doit-il être obligatoire ou optionnel ?
2. Faut-il pouvoir modifier un profil après création ?
3. Les scores psychologiques sont notés sur quelle échelle ? (1-5, 1-10, ...)`,
  
  options: [
    "1: Obligatoire | 2: Oui, modifiable | 3: 1-5",
    "1: Optionnel | 2: Oui, modifiable | 3: 1-5",
    "1: Obligatoire | 2: Non, lecture seule | 3: 1-10",
    "Laisse-moi préciser autrement"
  ]
});
```

### 6. Analyse des dépendances

Identifier les dépendances et prérequis :

```typescript
interface Dependencies {
  required_features: string[];     // ex: ["Gestion des évaluations"]
  impacted_features: string[];     // ex: ["Génération des plans"]
  breaking_changes_risk: boolean;
  migration_required: boolean;
}
```

## Template de sortie

Produire ce document structuré :

```markdown
# Analyse des besoins

## Type de tâche
**[Feature | Bugfix | Refactor | Enhancement]**

## Demande originale
```
{consigne_utilisateur_brute}
```

## Besoin reformulé
{description_claire_et_complete}

---

## Contexte technique actuel

### Backend
- **Packages concernés** : `services/`, `controllers/`, `entities/`, `repositories/`, `dto/`
- **Services existants impactés** : `EvaluationService`, `AthleteService`
- **Nouveaux endpoints** : Oui (détails en section Besoins)

### Frontend
- **Modules concernés** : `components/`, `services/`, `models/`
- **Composants existants impactés** : `evaluation-detail.component`
- **Nouvelles routes** : Oui (route vers formulaire profil psycho)

### Base de données
- **Tables concernées** : `evaluations` (FK), nouvelle table `profils_psychologiques`
- **Migrations requises** : Oui (création table + FK + index)

---

## Besoins identifiés

### 1. Backend
- Créer entity `ProfilPsychologique` avec :
  - `id_evaluation` (PK, FK → evaluations)
  - 7 colonnes de scores (INTEGER, @Min(1), @Max(5))
  - 2 colonnes texte (forces, faiblesses)
- Créer `ProfilPsychologiqueRepository` (extends JpaRepository)
- Créer `ProfilPsychologiqueService` (interface + impl) avec méthodes :
  - `create(Long idEvaluation, ProfilPsychologiqueRequest)`
  - `findByEvaluationId(Long idEvaluation)`
  - `update(Long idEvaluation, ProfilPsychologiqueRequest)`
- Créer `ProfilPsychologiqueController` avec endpoints :
  - `POST /api/v1/evaluations/{id}/profil-psychologique`
  - `GET /api/v1/evaluations/{id}/profil-psychologique`
  - `PUT /api/v1/evaluations/{id}/profil-psychologique`
- Créer DTOs : `ProfilPsychologiqueRequest`, `ProfilPsychologiqueResponse`

### 2. Frontend
- Créer `profil-psychologique.model.ts` (interface TypeScript)
- Créer `profil-psychologique.service.ts` (HTTP service avec inject())
- Créer `profil-psychologique-form.component.ts` (standalone, signals) avec :
  - Formulaire réactif (FormBuilder)
  - 7 sliders WebAwesome pour les scores
  - 2 textareas pour forces/faiblesses
  - Validation : scores 1-5, textes optionnels
  - i18n sur tous les labels
- Intégrer le composant dans `evaluation-detail.component`
- Ajouter clés i18n dans `fr.json` et `en.json`

### 3. Base de données
- Migration Flyway `V{date}__{story}__add_profil_psychologique.sql` :
  - Créer table `profils_psychologiques`
  - Ajouter FK vers `evaluations(id)`
  - Créer index sur `id_evaluation`
  - Ajouter contraintes CHECK sur scores (>= 1 AND <= 5)

---

## Contraintes métier

1. **Profil obligatoire** : Une évaluation doit avoir un profil psychologique (validation)
2. **Scores valides** : Tous les scores doivent être entre 1 et 5
3. **Forces/faiblesses optionnelles** : Texte libre, max 500 caractères chacun
4. **Un seul profil par évaluation** : Relation 1-1 avec évaluations
5. **Modification autorisée** : Le coach peut modifier le profil après création

---

## Contraintes techniques

### Backend (dev-practices.md)
- ✅ Utiliser Lombok (@Data, @RequiredArgsConstructor, @Slf4j)
- ✅ Injection par constructeur uniquement
- ✅ Architecture Controller → Service (interface) → Repository
- ✅ DTOs pour exposition (jamais entités JPA)
- ✅ Validation Jakarta sur entity et DTOs
- ✅ Migration Flyway idempotente

### Frontend (dev-practices.md)
- ✅ Standalone component
- ✅ Signals pour état local
- ✅ Reactive Forms (FormBuilder, FormGroup)
- ✅ Syntaxe moderne (@if, @for, pas *ngIf/*ngFor)
- ✅ WebAwesome + Tailwind (pas de CSS custom)
- ✅ i18n obligatoire (translate pipe)
- ✅ inject() plutôt que constructeur

### BDD (dev-practices.md)
- ✅ Nommage snake_case (table `profils_psychologiques`)
- ✅ Migration idempotente (IF NOT EXISTS)
- ✅ Index sur colonnes FK et WHERE/JOIN
- ✅ Contraintes CHECK pour validation

---

## Dépendances

### Prérequis
- ✅ Table `evaluations` existe
- ✅ `EvaluationService` existe (pour valider l'ID évaluation)

### Modules impactés
- `evaluation-detail.component` : ajout onglet/section profil psychologique
- Référentiel (futur) : utilisation des données profil pour calcul archétype

### Risques de breaking change
- ❌ Aucun : ajout de fonctionnalité, pas de modification d'existant

---

## Questions clarifiées avec l'utilisateur

**Q1** : Le profil psychologique doit-il être obligatoire ou optionnel ?
**R1** : Obligatoire - une évaluation complète doit avoir un profil psycho

**Q2** : Faut-il pouvoir modifier un profil après création ?
**R2** : Oui, le coach peut corriger/ajuster après coup

**Q3** : Les scores psychologiques sont notés sur quelle échelle ?
**R3** : 1 à 5 (1 = très faible, 5 = excellent)

---

## Recommandations pour @architecte

1. **Tests** : Prévoir tests unitaires sur `ProfilPsychologiqueService` et tests repository
2. **Performance** : Index sur `id_evaluation` crucial (requête fréquente)
3. **Validation** : Double validation (backend + frontend) pour UX + sécurité
4. **i18n** : Prévoir clés pour labels scores + messages erreur
5. **Accessibilité** : Sliders doivent avoir labels aria + navigation clavier

---

## Estimation complexité
**Charge estimée** : Moyenne
- Backend : ~4 fichiers + 1 migration
- Frontend : ~3 fichiers + i18n
- Tests : ~2 fichiers test backend
```

## Gestion des erreurs

### Documentation insuffisante
Si `/docs` manque d'informations critiques :
```markdown
🚨 BLOCAGE

La documentation ne contient pas d'information sur [X].
J'ai besoin de savoir [détails] pour continuer l'analyse.

Dois-je :
- Poser la question à l'utilisateur ?
- Faire une hypothèse raisonnable (préciser laquelle) ?
```

### Demande ambiguë
Si la demande utilisateur est trop floue :
```markdown
🔄 DEMANDE_CLARIFICATION @utilisateur

La demande "[extrait]" peut être interprétée de plusieurs façons :
1. [Interprétation 1]
2. [Interprétation 2]

Quelle interprétation corresponds à votre besoin ?
```

## Notes
- Privilégier la précision sur la vitesse : mieux vaut poser 3 questions que faire 10 hypothèses
- Toujours citer les sources (dev-practices.md, product.md) pour les contraintes
- Si doute entre "obligatoire" et "optionnel" → toujours demander
