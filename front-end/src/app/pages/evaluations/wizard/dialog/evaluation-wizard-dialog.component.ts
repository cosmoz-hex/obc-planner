import {
	ChangeDetectionStrategy,
	Component,
	computed,
	CUSTOM_ELEMENTS_SCHEMA,
	model,
	output,
	viewChild,
	viewChildren
} from '@angular/core';
import {TranslatePipe} from '@ngx-translate/core';
import {WizardComponent} from '../../../../components/wizard/wizard.component';
import {WizardStepComponent} from '../../../../components/wizard/wizard-step.component';
import {EvalWizardStep} from '../eval-wizard-step';
import {EvalWizardSpeedComponent} from '../speed/eval-wizard-speed.component';
import {EvalWizardStrengthComponent} from '../strength/eval-wizard-strength.component';
import {EvalWizardSnatchComponent} from '../snatch/eval-wizard-snatch.component';
import {EvalWizardCleanComponent} from '../clean/eval-wizard-clean.component';
import {EvalWizardJerkComponent} from '../jerk/eval-wizard-jerk.component';
import {EvalWizardSquatComponent} from '../squat/eval-wizard-squat.component';
import {EvalWizardCompetitionComponent} from '../competition/eval-wizard-competition.component';
import {EvalWizardEnduranceComponent} from '../endurance/eval-wizard-endurance.component';
import {EvalWizardPsychoComponent} from '../psycho/eval-wizard-psycho.component';
import {EvalWizardSummaryComponent} from '../summary/eval-wizard-summary.component';
import {EvalDetail} from '../../../../models/eval-detail.model';

// Composants WebAwesome utilisés (enregistrement ciblé).
import '@awesome.me/webawesome/dist/components/dialog/dialog.js';

/**
 * Modale d'ajout d'une évaluation : héberge le {@link WizardComponent} et ses
 * étapes métier — 8 volets physiques (Vitesse, Force, Arraché, Épaulé, Jeté,
 * Squat, Réussite en compétition, Endurance) puis 7 volets du profil
 * psychologique (Gestion émotionnelle, Confiance en soi, Motivation,
 * Concentration, Comportement compétitif, Rapport à l'échec, Autonomie et
 * responsabilisation).
 *
 * Les 7 étapes psychologiques sont rendues par itération sur
 * {@link EvalWizardPsychoComponent.BLOCKS} : la connaissance des blocs
 * (codes, libellés, affirmations) est portée par le composant psycho lui-même ;
 * la modale ne fait qu'itérer et passer la clé du bloc.
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
    EvalWizardCompetitionComponent,
    EvalWizardEnduranceComponent,
    EvalWizardPsychoComponent,
    EvalWizardSummaryComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './evaluation-wizard-dialog.component.html',
})
export class EvaluationWizardDialogComponent {

  /** Les 7 blocs du profil psychologique, portés par le composant psycho. */
  protected readonly psychoBlocks = EvalWizardPsychoComponent.BLOCKS;

  /** Clé i18n du libellé (titre) d'un bloc psychologique. */
  protected readonly psychoLabel = EvalWizardPsychoComponent.labelOf;

  /** Rang de la première étape psycho dans le wizard (après les 8 volets physiques). */
  protected readonly firstPsychoStep = 9;

  /** Rang de l'étape Synthèse (après les 8 volets physiques + 7 blocs psycho). */
  protected readonly summaryStep = this.firstPsychoStep + EvalWizardPsychoComponent.BLOCKS.length;

  /** Instances psycho projetées (ordre DOM = ordre des blocs). */
  private readonly psychoInstances = viewChildren(EvalWizardPsychoComponent);

  /** Résultats agrégés des 7 blocs psycho, dans l'ordre des blocs. */
  protected readonly psychoResults = computed<readonly (readonly EvalDetail[])[]>(
    () => this.psychoInstances().map((instance) => instance.value())
  );

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
