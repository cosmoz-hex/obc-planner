# Skill : Code Generator

**Utilisateur** : @developpeur

## Description
Génère le code backend, frontend et migrations BDD selon design de @architecte. Respecte 100% `.kiro/steering/dev-practices.md` (déjà en contexte).

## Référence des règles
**Toutes les règles de code sont dans `.kiro/steering/dev-practices.md`** (injecté automatiquement).

Ce skill se concentre sur la **génération**, pas sur la redéfinition des règles.

## Implémentation Backend

### Structure à générer
1. **Entities** : JPA + Lombok + validation Jakarta
2. **Repositories** : Interfaces Spring Data JPA
3. **Services** : Interface + Impl (avec @RequiredArgsConstructor, @Slf4j, @Transactional)
4. **Controllers** : REST endpoints (délégation pure)
5. **DTOs** : Request (class + validation) + Response (record)

### Points clés
- Suivre **exactement** les patterns de `dev-practices.md`
- Consulter code existant similaire pour cohérence
- Nommage : snake_case pour colonnes BDD, camelCase pour Java, kebab-case pour Angular

## Implémentation Frontend

### Structure à générer
1. **Models** : Interfaces TypeScript (correspondant aux DTOs backend)
2. **Services** : HTTP service avec `inject()`, Observable
3. **Components** : Standalone + signals + @if/@for
4. **Templates** : WebAwesome + Tailwind + i18n obligatoire
5. **i18n** : Clés dans `fr.json` ET `en.json` (synchronisés)

### Points clés
- Suivre **exactement** les conventions de `dev-practices.md`
- Utiliser `@if/@for/@switch` (jamais `*ngIf/*ngFor/*ngSwitch`)
- Utiliser `(model)` (jamais `[(ngModel)]`)
- Pas de CSS custom (Tailwind uniquement)
- Accessibilité : labels, aria, tabindex

## Migrations BDD

### Structure à générer
```sql
-- V{yyyymmdd}_{hhmiss}__{story}.sql

-- Idempotent (IF NOT EXISTS partout)
CREATE TABLE IF NOT EXISTS nom_table (
    id BIGSERIAL PRIMARY KEY,
    colonne VARCHAR(255) NOT NULL,
    ...
);

CREATE INDEX IF NOT EXISTS idx_nom_1 ON nom_table(colonne);
```

### Points clés
- Suivre **conventions nommage** de `dev-practices.md` (snake_case, pk_{table}, fk_{table}_{num}, idx_{table}_{num})
- Idempotence obligatoire
- Index sur FK et colonnes WHERE/JOIN/ORDER BY
- Contraintes CHECK pour validations

## Workflow de génération

1. **Lire le design** de @architecte attentivement
2. **Consulter code existant** similaire pour patterns
3. **Générer fichiers** en respectant 100% dev-practices.md
4. **Vérifier compilation** :
   ```bash
   # Backend
   cd backend && mvn clean compile
   
   # Frontend
   cd frontend && ng build --configuration development
   ```
5. **Vérifier conformité** (auto-check) :
   ```bash
   # Pas de @Autowired sur champs
   grep -r "@Autowired.*private" src/main/java  # Doit être vide
   
   # Pas de *ngIf/*ngFor
   grep -r "\*ngIf\|\*ngFor" src/app  # Doit être vide
   
   # Pas de texte en dur
   grep -r ">'[A-Z]" src/app/**/*.html  # Vérifier (doit être traduit)
   ```

## Output

Liste exhaustive :
```markdown
# Implémentation terminée

## Fichiers créés
### Backend
- ✅ entities/NouvelleEntity.java
- ✅ repositories/NouveauRepository.java
- ✅ services/NouveauService.java
- ✅ services/impl/NouveauServiceImpl.java
- ✅ controllers/NouveauController.java
- ✅ dto/NouveauRequest.java
- ✅ dto/NouveauResponse.java

### Frontend
- ✅ models/nouveau.model.ts
- ✅ services/nouveau.service.ts
- ✅ components/nouveau/nouveau.component.ts
- ✅ components/nouveau/nouveau.component.html

### BDD
- ✅ db/migration/V{date}__{story}.sql

## Fichiers modifiés
- ✅ app.routes.ts (route ajoutée)
- ✅ assets/i18n/fr.json (clés ajoutées)
- ✅ assets/i18n/en.json (clés ajoutées)

## Vérifications
- ✅ Backend compile sans erreur
- ✅ Frontend compile sans erreur
- ✅ Conformité dev-practices.md : 100%
- ✅ i18n complète (fr + en)
- ✅ Pas de TODO/FIXME
```

## Gestion des erreurs

**Si compilation échoue** :
1. Lire l'erreur
2. Corriger selon dev-practices.md
3. Retry (max 3 fois)
4. Si toujours échec → demander aide @architecte

**Si design incomplet** :
1. Demander clarification via @orchestrator → @architecte

## Notes
- **Ne pas réinventer** : Suivre patterns existants dans le code
- **Ne pas sur-engineer** : Implémenter exactement ce qui est demandé
- **Dev-practices.md est la source de vérité** pour toutes les règles de code
