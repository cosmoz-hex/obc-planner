import {ChangeDetectionStrategy, Component, CUSTOM_ELEMENTS_SCHEMA, model, output, viewChild, viewChildren} from '@angular/core';
import {TranslatePipe} from '@ngx-translate/core';
import {WizardComponent} from '../../../components/wizard/wizard.component';
import {WizardStepComponent} from '../../../components/wizard/wizard-step.component';
import {EvalWizardStep} from './eval-wizard-step';
import {EvalWizardSpeedComponent} from './speed/eval-wizard-speed.component';
import {EvalWizardStrengthComponent} from './strength/eval-wizard-strength.component';
import {EvalWizardSnatchComponent} from './snatch/eval-wizard-snatch.component';
import {EvalWizardCleanComponent} from './clean/eval-wizard-clean.component';
import {EvalWizardJerkComponent} from './jerk/eval-wizard-jerk.component';
import {EvalWizardSquatComponent} from './squat/eval-wizard-squat.component';
import {EvalWizardEnduranceComponent} from './endurance/eval-wizard-endurance.component';
import {EvalWizardPsychoEmotionalComponent} from './psycho/emotional/eval-wizard-psycho-emotional.component';
import {EvalWizardPsychoConfidenceComponent} from './psycho/confidence/eval-wizard-psycho-confidence.component';
import {EvalWizardPsychoMotivationComponent} from './psycho/motivation/eval-wizard-psycho-motivation.component';
import {EvalWizardPsychoFocusComponent} from './psycho/focus/eval-wizard-psycho-focus.component';
import {EvalWizardPsychoCompetitiveComponent} from './psycho/competitive/eval-wizard-psycho-competitive.component';
import {EvalWizardPsychoFailureComponent} from './psycho/failure/eval-wizard-psycho-failure.component';
import {EvalWizardPsychoAutonomyComponent} from './psycho/autonomy/eval-wizard-psycho-autonomy.component';

// Composants WebAwesome utilisés (enregistrement ciblé).
import '@awesome.me/webawesome/dist/components/dialog/dialog.js';

/**
 * Modale d'ajout d'une évaluation : héberge le {@link WizardComponent} et ses
 * étapes métier — 7 volets physiques (Vitesse, Force, Arraché, Épaulé, Jeté,
 * Squat, Endurance) puis 7 volets du profil psychologique (Gestion
 * émotionnelle, Confiance en soi, Motivation, Concentration, Comportement
 * compétitif, Rapport à l'échec, Autonomie et responsabilisation).
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
    EvalWizardSpeedComponent,
    EvalWizardStrengthComponent,
    EvalWizardSnatchComponent,
    EvalWizardCleanComponent,
    EvalWizardJerkComponent,
    EvalWizardSquatComponent,
    EvalWizardEnduranceComponent,
    EvalWizardPsychoEmotionalComponent,
    EvalWizardPsychoConfidenceComponent,
    EvalWizardPsychoMotivationComponent,
    EvalWizardPsychoFocusComponent,
    EvalWizardPsychoCompetitiveComponent,
    EvalWizardPsychoFailureComponent,
    EvalWizardPsychoAutonomyComponent
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

  /** Toutes les étapes implémentant {@link EvalWizardStep}, pour les reset à la fermeture. */
  private readonly steps = viewChildren(EvalWizardStep);

  /**
   * Ferme la modale uniquement si l'événement provient du dialog lui-même.
   * Les composants WebAwesome internes émettent aussi `wa-after-hide` (bubbling)
   * lors de leur propre fermeture : on ignore ces événements enfants.
   */
  protected onDialogHide(event: Event): void {
    if (event.target === event.currentTarget) {
      this.close.emit();
      this.wizard().currentStep.set(1);
      this.steps().forEach((step) => step.reset());
    }
  }

  protected onValidate(): void {
    this.validated.emit();
  }
}
