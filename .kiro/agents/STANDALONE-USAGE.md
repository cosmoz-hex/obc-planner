# Guide d'usage unitaire des agents

Les agents peuvent être utilisés **individuellement** en dehors du pipeline complet orchestré. Voici comment invoquer chaque agent de manière autonome.

## 🎯 Invocation directe

### Syntaxe générale
```
@nom_agent "Votre consigne + contexte nécessaire"
```

L'agent chargera automatiquement :
- Son fichier de définition `.kiro/agents/{nom}.md`
- Ses skills `.kiro/skills/{skill}/SKILL.md`
- Les contraintes `.kiro/steering/dev-practices.md`

---

## 📊 @analyste (usage unitaire)

**Cas d'usage** : Vous voulez analyser un besoin fonctionnel avant de passer à l'architecture.

### Invocation
```
@analyste "Je veux ajouter la fonctionnalité X. Voici le contexte : [description métier]"
```

### Input attendu
- Description du besoin métier
- Contexte utilisateur
- Objectif fonctionnel

### Output
Cahier des charges fonctionnel avec :
- User stories
- Règles métier
- Validations métier
- Questions clarifiées

### Exemple
```
@analyste "Je veux permettre aux coachs d'ajouter des notes textuelles sur chaque évaluation pour garder une trace des observations pendant les tests"
```

L'analyste va :
1. Lire `product.md` pour comprendre le contexte évaluations
2. Vous poser des questions si besoin (longueur max notes ? visibles par l'athlète ?)
3. Produire un cahier des charges fonctionnel

---

## 🏗️ @architecte (usage unitaire)

**Cas d'usage** : Vous avez un besoin clair et voulez un design technique sans passer par @analyste.

### Invocation
```
@architecte "Voici le besoin : [description]. Design technique requis : backend + frontend + BDD"
```

### Input attendu
- Besoin clairement exprimé (peut être le cahier des charges de @analyste)
- Modules concernés (backend / frontend / BDD)

### Output
Design technique détaillé avec :
- Signatures de méthodes Java
- Endpoints API
- Interfaces TypeScript
- Scripts migration Flyway
- Analyse d'impact

### Exemple
```
@architecte "Besoin : Ajouter un champ 'notes' (texte libre, max 1000 caractères) sur l'entity Evaluation. Accessible en lecture/écriture via API et interface. Design complet backend + frontend + BDD"
```

L'architecte va produire :
- Entity : `@Column(name = "notes") @Size(max = 1000) private String notes;`
- DTO modifications
- Endpoint update
- Component formulaire avec textarea
- Migration `ALTER TABLE evaluations ADD COLUMN notes VARCHAR(1000);`

---

## 💻 @developpeur (usage unitaire)

**Cas d'usage** : Vous avez le design technique et voulez l'implémentation directe.

### Invocation
```
@developpeur "Voici le design technique à implémenter : [coller design de @architecte]"
```

### Input attendu
- Design technique détaillé (idéalement output de @architecte)
- Fichiers à créer/modifier
- Spécifications précises

### Output
Code complet :
- Fichiers backend, frontend, migrations
- Code compilant et fonctionnel
- i18n complète

### Exemple
```
@developpeur "Implémenter l'ajout du champ notes sur Evaluation :

Backend :
- Entity Evaluation : ajouter @Column(name='notes') @Size(max=1000) String notes
- EvaluationRequest/Response : ajouter champ notes
- Service/Controller : pas de modification (déjà CRUD complet)

Frontend :
- evaluation.model.ts : ajouter notes?: string
- evaluation-form.component : ajouter textarea pour notes avec validation maxLength 1000
- i18n : clés evaluation.notes.label et evaluation.notes.placeholder

BDD :
- Migration : ALTER TABLE evaluations ADD COLUMN notes VARCHAR(1000);"
```

Le développeur va générer tous les fichiers conformément au design.

---

## ✅ @reviewer (usage unitaire)

**Cas d'usage** : Vous venez de coder et voulez une review avant de commiter.

### Invocation
```
@reviewer "Review le code suivant : [lister fichiers ou décrire changements]"
```

OU (si code déjà commité/staged)
```
@reviewer "Review les changements dans le dernier commit / les fichiers staged"
```

### Input attendu
- Liste des fichiers modifiés
- OU pointeur vers commit/branch
- OU description des changements

### Output
Review ✅ APPROUVÉ ou ❌ REFUSÉ avec :
- Checklist conformité dev-practices
- Problèmes détectés (fichier:ligne)
- Corrections à apporter

### Exemple
```
@reviewer "Review les fichiers suivants que je viens de créer :
- backend/entities/ProfilPsychologique.java
- backend/services/ProfilPsychologiqueService.java
- frontend/components/profil-form.component.ts

Vérifie conformité dev-practices et qualité code"
```

Le reviewer va analyser selon sa checklist complète et signaler tout problème.

---

## 📚 @documentaliste (usage unitaire)

**Cas d'usage** : Vous venez de coder une grosse feature et voulez synchroniser la doc.

### Invocation
```
@documentaliste "Mettre à jour /docs selon les changements suivants : [décrire changements]"
```

### Input attendu
- Description des changements (nouvelles tables, endpoints, dépendances)
- Fichiers de code concernés

### Output
- Fichiers `/docs/` mis à jour (ou "aucune mise à jour requise")
- Liste des sections modifiées

### Exemple
```
@documentaliste "J'ai ajouté une nouvelle table profils_psychologiques en BDD et 3 nouveaux endpoints API. Mettre à jour /docs/database-schema.md et /docs/api-reference.md en conséquence.

Détails :
- Table : profils_psychologiques (7 colonnes scores + 2 colonnes texte)
- Endpoints : POST/GET/PUT /api/v1/evaluations/{id}/profil-psychologique"
```

Le documentaliste va mettre à jour uniquement ce qui est nécessaire.

---

## 📝 @commiteur (usage unitaire)

**Cas d'usage** : Votre code est prêt, vous voulez juste générer le message de commit.

### Invocation
```
@commiteur "Générer message de commit pour les changements suivants : [décrire]"
```

### Input attendu
- Description des changements
- Type (feat/fix/refactor)
- Scope (module concerné)
- Fichiers modifiés

### Output
Message de commit conforme conventions Git du projet

### Exemple
```
@commiteur "Générer message de commit :

Type : feat
Scope : evaluations
Changements :
- Ajout champ notes (VARCHAR 1000) sur table evaluations
- Ajout textarea notes dans formulaire évaluation
- i18n fr + en
Ref : S0078"
```

Le commiteur va produire :
```
feat(evaluations): ajouter notes textuelles sur évaluations

Ajout d'un champ notes (texte libre, max 1000 caractères) permettant
aux coachs de garder une trace des observations pendant les tests.

Backend :
- Entity Evaluation : ajout colonne notes

Frontend :
- evaluation-form.component : ajout textarea avec validation
- i18n fr + en

BDD :
- Migration V20260810_220000__add_evaluation_notes.sql

Ref : S0078
```

---

## 🎭 @orchestrator (usage partiel)

Vous pouvez aussi utiliser l'orchestrateur pour lancer un **sous-ensemble** du pipeline :

### Pipeline partiel : analyse + architecture uniquement
```
@orchestrator "Analyse et design technique seulement (pas d'implémentation) : [besoin]"
```

L'orchestrateur va spawner @analyste puis @architecte et vous donner le design, sans passer par le développement.

### Pipeline sans review
```
@orchestrator "Implémenter [besoin] sans passer par le reviewer (je ferai la review moi-même)"
```

L'orchestrateur va skiper @reviewer et aller directement à @documentaliste + @commiteur.

---

## 💡 Conseils d'usage unitaire

### Quand utiliser le pipeline complet ?
- Feature complexe multi-modules
- Besoin de cohérence analyse → design → dev → review
- Vous voulez un rapport complet de bout en bout

### Quand utiliser les agents unitaires ?
- **@analyste** : Besoin fonctionnel flou, vous voulez clarifier avant de coder
- **@architecte** : Besoin clair, vous voulez juste le design technique
- **@developpeur** : Design prêt, vous voulez l'implémentation rapide
- **@reviewer** : Code prêt, vous voulez validation avant commit
- **@documentaliste** : Code commité, vous voulez sync /docs
- **@commiteur** : Tout est prêt, vous voulez juste le message de commit

### Enchaîner agents manuellement
Vous pouvez enchaîner manuellement sans passer par @orchestrator :

```
1. @analyste "Mon besoin..."
   [Attendre résultat]
   
2. @architecte "Voici le cahier des charges de @analyste : [coller]"
   [Attendre résultat]
   
3. @developpeur "Voici le design de @architecte : [coller]"
   [Attendre résultat]
   
4. @reviewer "Review le code de @developpeur"
   [Si OK]
   
5. @commiteur "Générer commit pour ces changements"
```

Cela vous donne **plus de contrôle** entre chaque étape.

---

## 🔧 Personnalisation pour usage unitaire

Si vous utilisez souvent un agent en standalone, vous pouvez créer des **templates de commandes** :

### Exemple : template review rapide
```bash
# ~/.kiro/crew/templates/quick-review.sh
@reviewer "Review rapide (conformité dev-practices uniquement) pour : $@"
```

Usage : `./quick-review.sh ProfilController.java ProfilService.java`

### Exemple : template design simple
```bash
# ~/.kiro/crew/templates/simple-design.sh
@architecte "Design technique simple (backend uniquement) : $@"
```

---

## 📊 Comparaison pipeline vs unitaire

| Critère | Pipeline complet | Agents unitaires |
|---|---|---|
| **Vitesse** | ~10-15 min | 1-3 min par agent |
| **Contrôle** | Automatique | Manuel entre chaque étape |
| **Traçabilité** | Rapport complet | Outputs isolés |
| **Complexité** | Feature complète | Tâche ciblée |
| **Boucles correction** | Auto (max 3) | Vous relancez manuellement |

**Recommandation** :
- Pipeline complet → Features complexes, travail de qualité
- Agents unitaires → Itérations rapides, ajustements mineurs

---

## ✅ Checklist avant usage unitaire

Avant d'invoquer un agent unitaire, assurez-vous d'avoir :

**@analyste** :
- [ ] Besoin métier décrit
- [ ] Contexte utilisateur clair

**@architecte** :
- [ ] Besoin fonctionnel clair (ou cahier des charges @analyste)
- [ ] Modules concernés identifiés

**@developpeur** :
- [ ] Design technique détaillé
- [ ] Spécifications précises (signatures, endpoints, tables)

**@reviewer** :
- [ ] Code écrit et compilant
- [ ] Liste fichiers à reviewer

**@documentaliste** :
- [ ] Code finalisé
- [ ] Changements listés (tables, endpoints, dépendances)

**@commiteur** :
- [ ] Code prêt à commit
- [ ] Type/scope/référence identifiés
