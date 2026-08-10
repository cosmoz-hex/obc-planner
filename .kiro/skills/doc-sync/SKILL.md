# Skill : Doc Sync

**Utilisateur** : @documentaliste

Synchronise `/docs` et `.kiro/steering` avec les changements du code, **uniquement si nécessaire**.

## Décision : mettre à jour ou non ?

### ✅ Mettre à jour `/docs/architecture-complete.md` si :
- Nouvelle dépendance Maven/npm
- Nouveau package backend ou module Angular
- Changement version majeure lib

### ✅ Mettre à jour `/docs/database-schema.md` si :
- Nouvelle table
- Nouvelle colonne sur table existante
- Nouvel index
- Contrainte ajoutée/modifiée

### ✅ Créer/mettre à jour `/docs/api-reference.md` si :
- Nouveau endpoint API REST
- Modification signature endpoint (breaking change)

### ❌ NE PAS mettre à jour si :
- Simple ajout méthode interne
- Correction bug
- Refactoring interne
- Test ajouté

## Principe
Préférer sous-documenter que sur-documenter. Le code est la source de vérité.

## Output
Liste des fichiers de doc mis à jour ou "aucune mise à jour requise".
