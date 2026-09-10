import {Signal} from '@angular/core';

/**
 * Contrat exposé par le conteneur de wizard à ses étapes projetées.
 *
 * Sert de jeton d'injection pour que {@link WizardStepComponent} accède à
 * l'étape courante sans importer {@link WizardComponent} — ce qui éviterait
 * un cycle d'import entre les deux fichiers (le conteneur, lui, référence les
 * étapes via `contentChildren`).
 */
export abstract class WizardHost {
  /** Numéro (1-based) de l'étape actuellement affichée. */
  abstract readonly currentStep: Signal<number>;
}
