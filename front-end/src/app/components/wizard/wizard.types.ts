import {Signal} from '@angular/core';

/**
 * Contrat exposé par le conteneur de wizard à ses étapes projetées.
 *
 * Sert de jeton d'injection pour que {@link WizardStepComponent} accède à
 * l'étape courante sans importer {@link WizardDialogComponent} — ce qui éviterait
 * un cycle d'import entre les deux fichiers (le conteneur, lui, référence les
 * étapes via `contentChildren`).
 */
export abstract class WizardHost {
  /** Numéro (1-based) de l'étape actuellement affichée. */
  abstract readonly currentStep: Signal<number>;
}

/**
 * État d'un fragment du stepper, selon sa position par rapport à l'étape courante :
 * courante, à venir (après la courante, `unvisited`), ou avant la courante,
 * valide ou non valide (`incomplete`).
 */
export type WizardStepperState = 'current' | 'unvisited' | 'valid' | 'incomplete';

/** Donnée d'affichage d'un fragment de {@link WizardStepperComponent}. */
export interface WizardStepperItem {
  /** Numéro (1-based) de l'étape. */
  step: number;
  /** Clé i18n du libellé de l'étape. */
  label: string;
  /** État d'affichage de l'étape. */
  state: WizardStepperState;
}
