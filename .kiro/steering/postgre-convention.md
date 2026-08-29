---
title: Development Practices
description: "PostgreSQL 17+ development practices"
inclusionMode: "fileMatch"
fileMatch:
  - "**/*.sql"
  - "**/*.java"
---

## PostgreSQL 17+

### Conventions de nommage
- Tables : `snake_case` au pluriel (`athletes`, `training_programs`)
- Colonnes : `snake_case` (`first_name`, `created_at`)
- Clés primaires : `pk_{table}` (`pk_athletes`)
- Clés étrangères : `fk_{table}_{num}` (`fk_athletes_1`)
- Index : `idx_{table}_{num)}` (`idx_athletes_1`)
- Contraintes : `uq_{table}_{num}` (`uq_athletes_1`), `chk_{table}_{num}` (`chk_athletes_1`)

### Bonnes pratiques
- Utiliser `TIMESTAMP`, `VARCHAR(n)`, `NUMERIC(p, s)`, `BOOLEAN` et `UUID` plutôt que `TEXT`, `FLOAT` ou `INT`
- Indexer systématiquement les colonnes utilisées dans les `WHERE`, `JOIN` et `ORDER BY`
- Ne jamais stocker de JSON sans raison valable — préférer des colonnes typées
- Utiliser `ENUM` PostgreSQL ou une table de référence pour les valeurs à choix limité
- Ajouter des contraintes de validation (`NOT NULL`, `UNIQUE`, `CHECK`) pour garantir l'intégrité des données
- Ajouter de la documentation sur les tables et les colonnes avec `COMMENT ON TABLE` et `COMMENT ON COLUMN`

### Requêtes SQL et performance
- Favoriser l'utilisation de JPA/Hibernate pour les requêtes simples — éviter les requêtes SQL brutes
- Éviter les requêtes dans des boucles côté backend — préférer les requêtes en batch, insertions ou mises à jour groupées ou retourner des listes plutôt que des requêtes individuelles multiples 
- Toujours utiliser des requêtes préparées avec des paramètres (`?`) pour éviter les injections SQL
- Préférer les `JOIN` explicites plutôt que les sous-requêtes imbriquées
- Éviter les `SELECT *` — sélectionner uniquement les colonnes nécessaires
- Utiliser des transactions (`@Transactional`) pour les opérations critiques ou multiples
- Utiliser des vues (standards ou matérialisées) pour les requêtes complexes ou coûteuses, et les rafraîchir périodiquement si nécessaires
- Éviter les DISTINCT, UNION ou GROUP BY inutiles — privilégier les index, les jointures appropriées ou UNION ALL si possible
- Favoriser l'utilisation de `EXISTS` plutôt que `IN` pour les sous-requêtes
- Paginer les listes avec `Pageable` côté Spring Data ou `LIMIT` / `OFFSET` côté SQL