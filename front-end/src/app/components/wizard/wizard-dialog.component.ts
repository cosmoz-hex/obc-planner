import {
	ChangeDetectionStrategy,
	Component,
	computed,
	contentChildren,
	CUSTOM_ELEMENTS_SCHEMA,
	effect,
	input,
	model,
	output
} from '@angular/core';
import {TranslatePipe} from '@ngx-translate/core';
import {WizardStepComponent} from './wizard-step.component';
import {WizardStepperComponent} from './wizard-stepper.component';
import {WizardHost, WizardStepperItem} from './wizard.types';

// Composants WebAwesome utilisés (enregistrement ciblé).
import '@awesome.me/webawesome/dist/components/dialog/dialog.js';
import '@awesome.me/webawesome/dist/components/button/button.js';

/** Compteur d'instances : garantit des `id` uniques dans le document. */
let nextWizardDialogId = 0;

/**
 * Modale de wizard à étapes, réutilisable et réactive.
 *
 * Encapsule un `wa-dialog` et la navigation entre les {@link WizardStepComponent}
 * projetées :
 * - zone haute fixe : libellé de l'étape, compteur et fragments cliquables ;
 * - zone centrale : étape courante uniquement (les autres restent montées mais masquées) ;
 * - zone basse fixe (footer) : Précédent / Suivant / Valider.
 *
 * Les fragments permettent un saut libre vers n'importe quelle étape ; seule la
 * validation finale exige que **toutes** les étapes soient valides.
 *
 * La garde `wa-after-hide` (événements émis aussi par les `wa-select` / `wa-tooltip`
 * imbriqués) et le retour à l'étape 1 sont centralisés ici : {@link close} n'est émis
 * que pour la fermeture effective du dialogue.
 */
@Component({
  selector: 'app-wizard-dialog',
  standalone: true,
  imports: [TranslatePipe, WizardStepperComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './wizard-dialog.component.html',
  providers: [{provide: WizardHost, useExisting: WizardDialogComponent}]
})
export class WizardDialogComponent implements WizardHost {

  /** Ouverture pilotée par le parent. */
  readonly open = input<boolean>(false);

  /** Clé i18n du titre de la modale. */
  readonly titleKey = input.required<string>();

  /** Étape courante (1-based). Double binding : pilotable par le parent. */
  readonly currentStep = model<number>(1);

  /** Émis au clic sur « Valider » (dernière étape, toutes étapes valides). */
  readonly validate = output<void>();

  /** Émis à la fermeture effective du dialogue (étape déjà remise à 1). */
  readonly close = output<void>();

  /** Étapes projetées, résolues (step > 0), triées par numéro croissant. */
  private readonly projectedSteps = contentChildren(WizardStepComponent);
  protected readonly steps = computed(() =>
    this.projectedSteps()
      .filter((step) => step.step() > 0)
      .sort((a, b) => a.step() - b.step())
  );

  protected readonly totalSteps = computed(() => this.steps().length);

  /** Index (0-based) de l'étape courante dans la liste triée (-1 si absente). */
  private readonly currentIndex = computed(() =>
    this.steps().findIndex((step) => step.step() === this.currentStep())
  );

  protected readonly isFirst = computed(() => this.currentIndex() <= 0);

  protected readonly isLast = computed(() => {
    const total = this.totalSteps();
    return total === 0 || this.currentIndex() === total - 1;
  });

  /** Validité de l'étape active (true par défaut si aucune étape résolue). */
  protected readonly currentValid = computed(() => {
    const index = this.currentIndex();
    return index >= 0 ? this.steps()[index].valid() : true;
  });

  /** Clé i18n du libellé de l'étape active. */
  protected readonly currentLabel = computed(() => {
    const index = this.currentIndex();
    return index >= 0 ? this.steps()[index].label() : '';
  });

  /** Numéro affiché (1-based) de l'étape courante. */
  protected readonly displayIndex = computed(() => this.currentIndex() + 1);

  /** Vrai si toutes les étapes sont valides. */
  protected readonly allValid = computed(() => this.steps().every((step) => step.valid()));

  /** Première étape invalide (visitée ou non), source du texte d'aide de « Valider ». */
  protected readonly firstInvalid = computed(() => this.steps().find((step) => !step.valid()));

  /**
   * Données d'affichage des fragments : l'état dépend de la position par rapport
   * à l'étape courante (avant : valide/incomplète, courante, après : à venir) et de la validité.
   */
  protected readonly stepperItems = computed<WizardStepperItem[]>(() => {
    const currentIndex = this.currentIndex();
    return this.steps().map((step, index) => ({
      step: step.step(),
      label: step.label(),
      state: index === currentIndex
        ? 'current'
        : index > currentIndex
          ? 'unvisited'
          : step.valid() ? 'valid' : 'incomplete'
    }));
  });

  /** Préfixe d'`id` propre à cette instance (liaison bouton ↔ texte d'aide). */
  protected readonly uid = `wizard-dialog-${nextWizardDialogId++}`;

  constructor() {
    // Robustesse : si l'étape courante ne correspond à aucune étape projetée
    // (numérotation ne démarrant pas à 1, valeur initiale hors bornes…), se
    // recaler sur la première étape dès que les étapes sont disponibles.
    effect(() => {
      const steps = this.steps();
      if (steps.length > 0 && this.currentIndex() === -1) {
        this.currentStep.set(steps[0].step());
      }
    });
  }

  protected goTo(stepNumber: number): void {
    if (this.steps().some((step) => step.step() === stepNumber)) {
      this.currentStep.set(stepNumber);
    }
  }

  protected previous(): void {
    const index = this.currentIndex();
    if (index > 0) {
      this.currentStep.set(this.steps()[index - 1].step());
    }
  }

  protected next(): void {
    const index = this.currentIndex();
    if (index >= 0 && index < this.totalSteps() - 1 && this.currentValid()) {
      this.currentStep.set(this.steps()[index + 1].step());
    }
  }

  protected onValidate(): void {
    if (this.isLast() && this.allValid()) {
      this.validate.emit();
    }
  }

  /**
   * Fermeture du dialogue. Ignore les `wa-after-hide` des composants imbriqués
   * (select, tooltip), remet le wizard à l'étape 1 puis notifie le parent.
   */
  protected onDialogHide(event: Event): void {
    if (event.target !== event.currentTarget) {
      return;
    }
    this.currentStep.set(1);
    this.close.emit();
  }
}
