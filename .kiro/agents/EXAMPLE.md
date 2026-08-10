# Exemple de Workflow — Pipeline Complet

Ce fichier montre un exemple concret d'utilisation du pipeline d'agents.

## Demande utilisateur

```
@orchestrator "Ajouter la gestion des profils psychologiques aux évaluations des athlètes"
```

## Déroulement du pipeline

### Étape 1 : @analyste

**Input** : Consigne utilisateur

**Actions** :
1. Lit `/docs/architecture-complete.md`, `/docs/database-schema.md`
2. Lit `.kiro/steering/dev-practices.md`, `.kiro/steering/product.md`
3. Identifie : Feature backend + frontend + BDD
4. Pose questions à l'utilisateur via `ask_question` :
   - "Le profil psychologique doit-il être obligatoire ?"
   - "Échelle de notation pour les scores ?"
   
**Output** : Document de besoins structuré avec :
- Type de tâche : Feature
- Modules impactés : backend (services, controllers, entities), frontend (components, services), BDD (nouvelle table)
- Contraintes métier et techniques
- Questions clarifiées

---

### Étape 2 : @architecte

**Input** : Document de besoins de @analyste

**Actions** :
1. Design backend : Entity, Repository, Service, Controller, DTOs
2. Design frontend : Model, Service, Component avec formulaire
3. Design BDD : Script migration Flyway complet
4. Analyse d'impact : Pas de régression, index nécessaire

**Output** : Design technique avec signatures détaillées :
```java
// Backend
public interface ProfilPsychologiqueService {
    ProfilPsychologiqueResponse create(Long idEvaluation, ProfilPsychologiqueRequest request);
    ProfilPsychologiqueResponse findByEvaluationId(Long idEvaluation);
    // ...
}

// Frontend
@Component({ selector: 'app-profil-psychologique-form', ... })
export class ProfilPsychologiqueFormComponent {
  form = this.fb.group({ /* ... */ });
  onSubmit() { /* ... */ }
}

// BDD
CREATE TABLE profils_psychologiques (
  id_evaluation VARCHAR(255) PRIMARY KEY,
  score_gestion_emotionnelle INTEGER CHECK (score >= 1 AND score <= 5),
  // ...
);
```

---

### Étape 3 : @developpeur

**Input** : Design technique de @architecte

**Actions** :
1. Génère tous les fichiers backend :
   - `ProfilPsychologique.java` (entity avec Lombok)
   - `ProfilPsychologiqueRepository.java` (interface JPA)
   - `ProfilPsychologiqueService.java` + `ProfilPsychologiqueServiceImpl.java`
   - `ProfilPsychologiqueController.java`
   - `ProfilPsychologiqueRequest.java` / `ProfilPsychologiqueResponse.java`
2. Génère tous les fichiers frontend :
   - `profil-psychologique.model.ts`
   - `profil-psychologique.service.ts`
   - `profil-psychologique-form.component.ts` + `.html`
3. Génère migration BDD :
   - `V20260810_210000__add_profil_psychologique.sql`
4. Écrit tests unitaires :
   - `ProfilPsychologiqueServiceImplTest.java`
   - `ProfilPsychologiqueRepositoryTest.java`
5. Vérifie compilation, imports, i18n

**Output** : 
```markdown
# Implémentation terminée

## Fichiers créés
✅ 7 fichiers backend
✅ 3 fichiers frontend
✅ 1 migration BDD
✅ 2 fichiers test
✅ Clés i18n ajoutées (fr.json, en.json)

## Vérifications
✅ Code compile
✅ Respect 100% dev-practices.md
✅ Tests passent
```

---

### Étape 4 : @reviewer

**Input** : Code de @developpeur

**Actions** :
1. Vérifie conformité dev-practices :
   - ✅ Lombok sur tous les fichiers backend
   - ✅ Injection par constructeur
   - ✅ DTOs utilisés (pas entités JPA exposées)
   - ✅ Frontend standalone, signals, @if/@for
   - ✅ i18n sur tous les textes
   - ✅ Migration idempotente
2. Vérifie complétude fonctionnelle :
   - ✅ Toutes les specs @architecte implémentées
   - ✅ Validation des inputs (1-5)
   - ✅ Gestion d'erreurs
3. Vérifie régression :
   - ✅ Pas d'impact sur existant
   - ✅ Migration réversible
4. Vérifie performance :
   - ✅ Index sur id_evaluation
   - ✅ Pas de requêtes N+1

**Output** :
```markdown
# Review : ✅ APPROUVÉ

Code conforme aux standards, fonctionnalités complètes, pas de régression.

Validation : Le code est prêt pour mise à jour documentation et commit.
```

---

### Étape 5 : @documentaliste

**Input** : Validation de @reviewer

**Actions** :
1. Analyse changements : Nouvelle table + nouveaux endpoints
2. Décision : Mise à jour nécessaire
3. Met à jour `/docs/database-schema.md` :
   - Ajoute table `profils_psychologiques`
4. Crée `/docs/api-reference.md` :
   - Documente nouveaux endpoints

**Output** :
```markdown
# Documentation mise à jour

## Fichiers modifiés
✅ /docs/database-schema.md (ajout table profils_psychologiques)
✅ /docs/api-reference.md (créé avec nouveaux endpoints)
```

---

### Étape 6 : @commiteur

**Input** : Tous les outputs précédents

**Actions** :
1. Analyse type de changement : Feature
2. Détermine scope : evaluations
3. Rédige title : "ajouter profil psychologique"
4. Rédige body avec détails
5. Extrait référence : S0042

**Output** :
```
feat(evaluations): ajouter profil psychologique

Ajout du profil psychologique dans le système d'évaluation des athlètes.
Le profil comprend 7 dimensions (gestion émotionnelle, confiance, motivation,
concentration, compétition, rapport à l'échec, autonomie) notées de 1 à 5.

Backend :
- Création entity ProfilPsychologique avec validation
- Création service et repository
- Ajout endpoint POST/GET/PUT /api/v1/evaluations/{id}/profil-psychologique
- DTO ProfilPsychologiqueRequest/Response

Frontend :
- Composant formulaire profil-psychologique-form.component
- Service HTTP profil-psychologique.service
- Ajout route et intégration dans evaluation-detail

BDD :
- Migration V20260810_210000__add_profil_psychologique.sql
- Table profils_psychologiques avec FK vers evaluations
- Index sur id_evaluation

Breaking changes : Aucun

Ref: S0042
```

---

### Étape 7 : @orchestrator (rapport final)

**Output vers utilisateur** :

```markdown
# 🎉 Pipeline terminé avec succès

## Résumé exécutif
**Feature** : Gestion des profils psychologiques
**Durée** : ~8 minutes
**Agents impliqués** : analyste (1), architecte (1), developpeur (1), reviewer (1), documentaliste (1), commiteur (1)

## Changements apportés
- **Backend** : 7 fichiers créés
- **Frontend** : 3 fichiers créés
- **Base de données** : 1 migration
- **Tests** : 2 tests ajoutés
- **Documentation** : 2 fichiers mis à jour

## Message de commit proposé
```
feat(evaluations): ajouter profil psychologique

[Message complet ci-dessus]
```

## Prochaine étape
Vous pouvez maintenant commiter avec :
```bash
git add .
git commit -m "$(cat <<'EOF'
feat(evaluations): ajouter profil psychologique

Ajout du profil psychologique dans le système d'évaluation...
[message complet]
EOF
)"
```
```

---

## Cas avec boucle de correction

Si @reviewer avait détecté un problème :

```markdown
# Review : ❌ REFUSÉ

## Problèmes bloquants

### Conformité dev-practices ❌
- ❌ ProfilPsychologiqueController.java:15 : Utilise @Autowired sur champ (doit être injection constructeur)
- ❌ profil-psychologique-form.component.html:23 : Utilise *ngIf (doit être @if)

### Bugs détectés 🐛
- 🐛 ProfilPsychologiqueServiceImpl.java:42 : Pas de validation si évaluation existe avant création profil

## Actions requises
Retour @developpeur pour corrections (tentative 1/3)
```

L'orchestrateur re-spawnerait alors @developpeur avec ces corrections, puis @reviewer une 2ème fois.

---

## Escalade utilisateur

Si après 3 tentatives @reviewer refuse toujours :

```markdown
🚨 Pipeline bloqué après 3 tentatives

@reviewer refuse le code avec les problèmes suivants :
- [Problème 1]
- [Problème 2]

Comment souhaitez-vous procéder ?

[OPTIONS: Proposer une alternative technique | Modifier les specs initiales | Accepter avec réserves | Arrêter le pipeline]
```
