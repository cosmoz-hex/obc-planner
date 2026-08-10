# Skill : Commit Message

**Utilisateur** : @commiteur

Génère un message de commit conforme aux conventions Git du projet.

## Convention
```
{type}({scope}): {title}

{body}

Ref: {reference}
```

### Types
- `feat` : Nouvelle fonctionnalité
- `fix` : Correction bug
- `refactor` : Refactoring sans changement fonctionnel
- `perf` : Amélioration performance
- `docs` : Modification documentation seule
- `style` : Formatage, typos
- `security` : Correction sécurité

### Scope
Module impacté (athletes, evaluations, training-plans, referentiel, etc.)

### Title
- Max 72 caractères
- Verbe infinitif
- Pas de point final
- En français

### Body
- Décrire le changement (quoi, pourquoi)
- Lister fichiers principaux
- Mentionner breaking changes si applicable

### Reference
Identifiant story/feature (S0001, F0042, B0015) ou N/A

## Exemple
```
feat(evaluations): ajouter profil psychologique

Ajout du profil psychologique dans le système d'évaluation.
Comprend 7 dimensions notées 1-5 + forces/faiblesses texte.

Backend :
- Entity, Repository, Service, Controller
- Endpoint POST/GET/PUT /api/v1/evaluations/{id}/profil-psychologique

Frontend :
- Component formulaire avec sliders WebAwesome
- Service HTTP et routing

BDD :
- Migration V20260810_210000__add_profil_psychologique.sql
- Table profils_psychologiques avec FK

Breaking changes : Aucun

Ref: S0042
```

## Output
Message de commit prêt à être utilisé.
