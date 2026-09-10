import {
	ChangeDetectionStrategy,
	Component,
	computed,
	contentChildren,
	CUSTOM_ELEMENTS_SCHEMA,
	effect,
	model,
	output
} from '@angular/core';
import {TranslatePipe} from '@ngx-translate/core';
import {WizardStepComponent} from './wizard-step.component';
import {WizardHost} from './wizard.types';

// Composants WebAwesome utilisés (enregistrement ciblé).
import '@awesome.me/webawesome/dist/components/progress-bar/progress-bar.js';
import '@awesome.me/webawesome/dist/components/button/button.js';

/**
 * Conteneur de wizard à étapes, réutilisable et réactif.
 *
 * Il projette une liste de {@link WizardStepComponent} (chaque enfant = une
 * étape identifiée par son attribut `step`) et pilote :
 * - l'affichage de l'étape courante uniquement (les autres sont masquées) ;
 * - un indicateur d'avancement (barre de progression + compteur) ;
 * - la navigation Précédent / Suivant et la validation finale.
 *
 * Règles des boutons :
 * - **Précédent** : masqué sur la première étape.
 * - **Suivant** : masqué sur la dernière étape ; désactivé si l'étape courante
 *   est invalide.
 * - **Valider** : visible uniquement sur la dernière étape ; désactivé si
 *   l'étape courante est invalide. Émet {@link validate}.
 *
 * Le wizard ne connaît aucune logique métier : chaque étape expose sa validité
 * via l'input `valid` de {@link WizardStepComponent}.
 */
@Component({
  selector: 'app-wizard',
  standalone: true,
  imports: [TranslatePipe],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './wizard.component.html',
  host: {class: 'flex flex-1 flex-col'},
  providers: [{provide: WizardHost, useExisting: WizardComponent}]
})
export class WizardComponent implements WizardHost {

  /** Étape courante (1-based). Double binding : pilotable par le parent. */
  readonly currentStep = model<number>(1);

  /** Émis au clic sur « Valider » (dernière étape, formulaire valide). */
  readonly validate = output<void>();

  /** Étapes projetées, triées par numéro d'étape croissant. */
  private readonly projectedSteps = contentChildren(WizardStepComponent);
  protected readonly steps = computed(() =>
    [...this.projectedSteps()].sort((a, b) => a.step() - b.step())
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

  /** Progression en pourcentage (0-100) pour la barre. */
  protected readonly progress = computed(() => {
    const total = this.totalSteps();
    return total === 0 ? 0 : Math.round(((this.currentIndex() + 1) / total) * 100);
  });

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
    if (this.isLast() && this.currentValid()) {
      this.validate.emit();
    }
  }
}
