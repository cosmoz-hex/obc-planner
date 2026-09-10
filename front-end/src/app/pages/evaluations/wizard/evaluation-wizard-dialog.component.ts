import {ChangeDetectionStrategy, Component, CUSTOM_ELEMENTS_SCHEMA, model, output, viewChild} from '@angular/core';
import {TranslatePipe} from '@ngx-translate/core';
import {WizardComponent} from '../../../components/wizard/wizard.component';
import {WizardStepComponent} from '../../../components/wizard/wizard-step.component';
import {EvalWizardForceComponent} from './force/eval-wizard-force.component';
import {EvalWizardTechniqueComponent} from './technique/eval-wizard-technique.component';
import {EvalWizardEnduranceComponent} from './endurance/eval-wizard-endurance.component';
import {EvalWizardPsychoComponent} from './psycho/eval-wizard-psycho.component';

// Composants WebAwesome utilisés (enregistrement ciblé).
import '@awesome.me/webawesome/dist/components/dialog/dialog.js';

/**
 * Modale d'ajout d'une évaluation : héberge le {@link WizardComponent} et ses
 * étapes métier (Force-Vitesse, Technique, Endurance, Psychologique).
 *
 * Chaque étape est un composant autonome qui expose sa validité ; la modale se
 * contente de les câbler dans le wizard et de relayer la validation finale.
 */
@Component({
  selector: 'app-evaluation-wizard-dialog',
  standalone: true,
  imports: [
    TranslatePipe,
    WizardComponent,
    WizardStepComponent,
    EvalWizardForceComponent,
    EvalWizardTechniqueComponent,
    EvalWizardEnduranceComponent,
    EvalWizardPsychoComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './evaluation-wizard-dialog.component.html',
  styles: [`
    :host { display: contents; }
  `]
})
export class EvaluationWizardDialogComponent {

  /** Ouverture pilotée par le parent. */
  readonly open = model<boolean>(false);

  /** Demande de fermeture (croix, Échap, clic hors modale). */
  readonly close = output<void>();

  /** Validation finale du wizard (dernière étape). */
  readonly validated = output<void>();

  /** Référence au wizard projeté, pour réinitialiser l'étape à la fermeture. */
  private readonly wizard = viewChild.required(WizardComponent);

  /**
   * Ferme la modale uniquement si l'événement provient du dialog lui-même.
   * Les composants WebAwesome internes émettent aussi `wa-after-hide` (bubbling)
   * lors de leur propre fermeture : on ignore ces événements enfants.
   */
  protected onDialogHide(event: Event): void {
    if (event.target === event.currentTarget) {
      this.close.emit();
      this.wizard().currentStep.set(1);
    }
  }

  protected onValidate(): void {
    this.validated.emit();
  }
}
