```markdown
# Fonctionnalités Clés - OBC Planner

## 🔍 1. Filtrage Dynamique en Temps Réel
Le composant de liste intègre un formulaire réactif groupé (`filterForm`) dont les changements se traduisent par des signaux réactifs. Il permet de filtrer instantanément les enregistrements selon :
* **Champ de Recherche :** Correspondance sur le nom ou le prénom (insensible à la casse).
* **Catégorie :** Filtrage spécifique par catégorie de poids.
* **Niveau Compétitif :** Filtrage par niveau de l'athlète.
* **Bouton de Réinitialisation :** Permet de réinitialiser l'ensemble des filtres en un seul clic.

---

## 📝 2. Gestion des Athlètes (Modales et Formulaires Réactifs)
* **Validations Robustes :** Les formulaires de création et d'édition valident les champs obligatoires (`Validators.required`), les tranches d'âge autorisées (10 à 70 ans) ainsi que les poids valides (20 à 150 kg).
* **Mode Double :** Le formulaire détecte automatiquement s'il s'agit d'un mode *Ajout* ou *Édition*, chargeant ou réinitialisant les données correspondantes dans la modale.
* **Confirmation de Suppression :** Les actions de suppression requièrent une validation préalable via une boîte de dialogue contextuelle afin d'éviter toute suppression accidentelle.

---

## 🌍 3. Internationalisation (i18n)
L'application intègre un support multilingue complet grâce à la bibliothèque **`ngx-translate`**.
* L'ensemble des textes statiques de l'interface (titres, boutons, tableaux, *placeholders*, messages de dialogue et messages de validation) s'appuie sur un fichier de ressources centralisé au format JSON (`front-end/src/assets/i18n/fr.json`), assurant une localisation en français de la plateforme.