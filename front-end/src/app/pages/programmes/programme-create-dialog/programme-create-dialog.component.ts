import {
  ChangeDetectionStrategy,
  Component,
  computed,
  CUSTOM_ELEMENTS_SCHEMA,
  effect,
  ElementRef,
  inject,
  input,
  output,
  signal,
  untracked,
  viewChild
} from '@angular/core';
import {TranslatePipe, TranslateService} from '@ngx-translate/core';
import {form, FormField, min, required} from '@angular/forms/signals';
import {WaSelectControlDirective} from '../../../directives/wa-forms/wa-select-control.directive';
import {WaInputControlDirective} from '../../../directives/wa-forms/wa-input-control.directive';
import {WaNumberInputControlDirective} from '../../../directives/wa-forms/wa-number-input-control.directive';
import {WaFieldErrorDirective} from '../../../directives/wa-forms/wa-field-error.directive';
import {waEventValue} from '../../../directives/wa-forms/wa-event-value';
import {LocalizedDatePipe} from '../../../pipes/localized-date.pipe';
import {WizardDialogComponent} from '../../../components/wizard/wizard-dialog.component';
import {WizardStepComponent} from '../../../components/wizard/wizard-step.component';
import {
  DURATION_OPTIONS,
  FREQUENCY_OPTIONS,
  ProgrammeCreateRequest,
  WEEKS_OPTIONS
} from '../../../models/programme.model';
import {Athlete, AthleteFilter} from '../../../models/athlete.model';
import {Evaluation} from '../../../models/evaluation.model';
import {EvaluationDetail} from '../../../models/evaluation-detail.model';
import {Archetype, Endurance, StrengthSpeed, Technique} from '../../../models/archetype.model';
import {MUSCULATION_FLAGS, MusculationKey, ProtocolGoal} from '../../../models/eval-summary.model';
import {GridFilter} from '../../../models/data-grid.model';
import {AthleteService} from '../../../services/athlete.service';
import {EvaluationService} from '../../../services/evaluation.service';
import {resolveArchetype} from '../../evaluations/wizard/summary/archetype-combinations';

// Composants WebAwesome utilisés (enregistrement ciblé).
import '@awesome.me/webawesome/dist/components/select/select.js';
import '@awesome.me/webawesome/dist/components/option/option.js';
import '@awesome.me/webawesome/dist/components/input/input.js';
import '@awesome.me/webawesome/dist/components/toast/toast.js';
import type WaToast from '@awesome.me/webawesome/dist/components/toast/toast.js';

/**
 * Modèle de l'étape 1 (Profil + Évaluation). Toutes les listes sont des chaînes
 * (leçon 2026-11-07 : `wa-select` compare ses valeurs en string) ; `''` = non renseigné.
 * Le bitmask de musculation est porté à part (`musculation`), le multiselect n'étant
 * pas géré par {@link WaSelectControlDirective}.
 */
interface ProfileFormModel {
  athleteId: string;
  evaluationId: string;
  strengthSpeed: string;
  technique: string;
  endurance: string;
  archetype: string;
  snatch: string;
  clean: string;
  jerk: string;
  squat: string;
  pull: string;
}

/** Modèle de l'étape 2 (Format + objectifs). */
interface FormatFormModel {
  weeks: string;
  frequency: string;
  duration: string;
  startDate: string;
  snatchGoal: number | null;
  cjGoal: number | null;
}

/**
 * Modale de génération d'un programme, en wizard à 2 étapes.
 *
 * - Étape 1 « Profil » : athlète (obligatoire), évaluation (optionnelle, effaçable),
 *   puis la synthèse (profil, points faibles techniques, protocole). Sélectionner une
 *   évaluation pré-remplit la synthèse (handler explicite) ; vider la sélection ne
 *   modifie rien ; changer d'athlète ne vide que l'évaluation si elle ne lui appartient pas.
 * - Étape 2 « Format » : semaines, fréquence, début, durée, objectifs.
 *
 * La psychologie n'est pas saisie. Le back résout l'évaluation (création, réutilisation
 * ou duplication) à partir de `evaluationId` + `profile`.
 */
@Component({
  selector: 'app-programme-create-dialog',
  standalone: true,
  imports: [
    TranslatePipe,
    LocalizedDatePipe,
    FormField,
    WaSelectControlDirective,
    WaInputControlDirective,
    WaNumberInputControlDirective,
    WaFieldErrorDirective,
    WizardDialogComponent,
    WizardStepComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './programme-create-dialog.component.html'
})
export class ProgrammeCreateDialogComponent {

  private readonly translate = inject(TranslateService);
  private readonly athleteService = inject(AthleteService);
  private readonly evaluationService = inject(EvaluationService);

  readonly open = input<boolean>(false);

  readonly save = output<ProgrammeCreateRequest>();
  readonly close = output<void>();

  // --- Options (mêmes valeurs que EvalWizardSummaryComponent) ---
  protected readonly weeksOptions = WEEKS_OPTIONS;
  protected readonly frequencyOptions = FREQUENCY_OPTIONS;
  protected readonly durationOptions = DURATION_OPTIONS;
  protected readonly strengthSpeedOptions: readonly StrengthSpeed[] = ['STRENGTH', 'MID', 'SPEED'];
  protected readonly techniqueOptions: readonly Technique[] = ['LOW', 'MID', 'HIGH'];
  protected readonly enduranceOptions: readonly Endurance[] = ['LOW', 'MID', 'HIGH'];
  protected readonly archetypeOptions: readonly Archetype[] = ['MID', 'ROUGH', 'TECH', 'CYCLE', 'LEARN'];
  protected readonly protocolOptions: readonly ProtocolGoal[] = ['STRENGTH', 'MID', 'SPEED'];
  protected readonly weaknessOptions: readonly string[] = ['EXT', 'CATCH', 'PATH'];
  protected readonly musculationOptions: readonly MusculationKey[] =
    ['GENERAL', 'LEGS', 'POSTERIOR_CHAIN', 'UPPER_BODY'];

  // --- Listes déroulantes (chargées une fois, size=0) ---
  private readonly athletesQuery = computed<AthleteFilter & GridFilter>(() => ({
    sexe: null,
    ageCategorie: null,
    page: 0,
    size: 0,
    sort: 'lastName,asc'
  }));
  private readonly athletesResource = this.athleteService.getAll(this.athletesQuery);
  protected readonly athletes = computed<readonly Athlete[]>(() => this.athletesResource.value()?.content ?? []);

  /** Toutes les évaluations (tri date décroissante), filtrées par athlète côté client. */
  private readonly evaluationsQuery = computed<GridFilter>(() => ({
    page: 0,
    size: 0,
    sort: 'evaluationDate,desc'
  }));
  private readonly evaluationsResource = this.evaluationService.getAll(this.evaluationsQuery);
  protected readonly evaluations = computed<readonly Evaluation[]>(() => this.evaluationsResource.value()?.content ?? []);

  // --- Wizard ---
  protected readonly currentStep = signal(1);

  // --- Étape 1 : profil ---
  protected readonly profileModel = signal<ProfileFormModel>(this.emptyProfile());
  /** Bitmask de musculation (0..15). */
  protected readonly musculation = signal(0);

  protected readonly profileForm = form(this.profileModel, (path) => {
    required(path.athleteId, {message: 'programmes.create.errors.athlete'});
    required(path.strengthSpeed, {message: 'programmes.create.errors.strengthSpeed'});
    required(path.technique, {message: 'programmes.create.errors.technique'});
    required(path.endurance, {message: 'programmes.create.errors.endurance'});
    required(path.archetype, {message: 'programmes.create.errors.archetype'});
    required(path.squat, {message: 'programmes.create.errors.squat'});
    required(path.pull, {message: 'programmes.create.errors.pull'});
  });

  /** Évaluations de l'athlète sélectionné. */
  protected readonly evaluationsForAthlete = computed<readonly Evaluation[]>(() => {
    const athleteId = this.profileModel().athleteId;
    if (!athleteId) {
      return [];
    }
    const id = Number(athleteId);
    return this.evaluations().filter((e) => e.athleteId === id);
  });

  /** Clés de musculation cochées (dérivées du bitmask). */
  protected readonly musculationSelected = computed<string[]>(() =>
    this.musculationOptions.filter((key) => (this.musculation() & MUSCULATION_FLAGS[key]) !== 0)
  );

  // --- Étape 2 : format ---
  protected readonly formatModel = signal<FormatFormModel>(this.emptyFormat());

  protected readonly formatForm = form(this.formatModel, (path) => {
    required(path.weeks, {message: 'programmes.create.errors.weeks'});
    required(path.frequency, {message: 'programmes.create.errors.frequency'});
    required(path.startDate, {message: 'programmes.create.errors.startDate'});
    required(path.snatchGoal, {message: 'programmes.create.errors.snatchGoal'});
    min(path.snatchGoal, 1, {message: 'programmes.create.errors.snatchGoalMin'});
    required(path.cjGoal, {message: 'programmes.create.errors.cjGoal'});
    min(path.cjGoal, 1, {message: 'programmes.create.errors.cjGoalMin'});
  });

  /** Date de fin calculée en lecture seule : `startDate + weeks*7 - 1 jour`. */
  protected readonly endDate = computed<string>(() => {
    const {startDate, weeks} = this.formatModel();
    if (!startDate || !weeks) {
      return '';
    }
    const start = this.parseIsoDate(startDate);
    if (!start) {
      return '';
    }
    const end = new Date(start.getTime());
    end.setDate(end.getDate() + Number(weeks) * 7 - 1);
    return this.formatIsoDate(end);
  });

  // --- Divers ---
  private readonly toast = viewChild<ElementRef<WaToast>>('errorToast');

  /** Numéro de requête de pré-remplissage : écarte les réponses obsolètes. */
  private loadSeq = 0;

  /** Vrai pendant le chargement d'une évaluation : bloque Suivant / Valider. */
  protected readonly loadingEvaluation = signal(false);

  /** Élément ayant déclenché l'ouverture (focus rendu à la fermeture). */
  private opener: HTMLElement | null = null;

  constructor() {
    // Réinitialise le wizard à chaque (ré)ouverture et mémorise le déclencheur.
    effect(() => {
      const isOpen = this.open();
      untracked(() => {
        this.loadSeq++;
        this.loadingEvaluation.set(false);
        this.profileModel.set(this.emptyProfile());
        this.musculation.set(0);
        this.formatModel.set(this.emptyFormat());
        this.currentStep.set(1);
        if (isOpen) {
          const active = document.activeElement;
          this.opener = active instanceof HTMLElement ? active : null;
        }
      });
    });
  }

  /** Traduit une clé i18n de manière impérative. */
  protected t(key: string): string {
    return this.translate.instant(key);
  }

  /**
   * Changement d'athlète : ne vide que l'évaluation si elle n'appartient pas au
   * nouvel athlète. La synthèse n'est jamais touchée.
   */
  protected onAthleteChange(event: Event): void {
    const athleteId = Number(waEventValue(event));
    const evaluationId = this.profileModel().evaluationId;
    if (!evaluationId) {
      // Aucune évaluation sélectionnée : invalide malgré tout un chargement en cours.
      this.loadSeq++;
      this.loadingEvaluation.set(false);
      return;
    }
    const owned = this.evaluations().some(
      (e) => String(e.evaluationId) === evaluationId && e.athleteId === athleteId
    );
    if (!owned) {
      // Évaluation vidée : toute réponse de getById encore en vol devient obsolète.
      this.loadSeq++;
      this.loadingEvaluation.set(false);
      this.profileModel.update((m) => ({...m, evaluationId: ''}));
    }
  }

  /**
   * Changement d'évaluation : valeur vide → aucune autre modification (la directive
   * a déjà vidé le champ) ; sinon pré-remplit la synthèse depuis l'évaluation.
   */
  protected async onEvaluationChange(event: Event): Promise<void> {
    const evaluationId = waEventValue(event);
    const seq = ++this.loadSeq;
    if (!evaluationId) {
      this.loadingEvaluation.set(false);
      return;
    }
    this.loadingEvaluation.set(true);
    try {
      const evaluation = await this.evaluationService.getById(Number(evaluationId));
      if (seq !== this.loadSeq) {
        return;
      }
      this.applyEvaluation(evaluation);
    } catch {
      if (seq !== this.loadSeq) {
        return;
      }
      this.profileModel.update((m) => ({...m, evaluationId: ''}));
      this.toast()?.nativeElement.create(this.t('programmes.create.errors.evaluationLoad'), {
        variant: 'danger',
        icon: 'triangle-exclamation'
      });
    } finally {
      // Seule la requête courante lève le verrou (une réponse obsolète ne doit pas le faire).
      if (seq === this.loadSeq) {
        this.loadingEvaluation.set(false);
      }
    }
  }

  /**
   * Modification utilisateur d'un axe force-vitesse / technique / endurance :
   * recalcule l'archétype (conservé si la combinaison n'est pas référencée).
   */
  protected onAxisChange(axis: 'strengthSpeed' | 'technique' | 'endurance', event: Event): void {
    const current = {...this.profileModel(), [axis]: waEventValue(event)};
    const archetype = resolveArchetype(
      (current.strengthSpeed || null) as StrengthSpeed | null,
      (current.technique || null) as Technique | null,
      (current.endurance || null) as Endurance | null
    );
    if (archetype) {
      this.profileModel.update((m) => ({...m, archetype}));
    }
  }

  /** Sélection multiple musculation : recompose le bitmask depuis les clés cochées. */
  protected onMusculation(event: Event): void {
    const raw = (event.target as { value?: string | string[] }).value;
    const keys = Array.isArray(raw) ? raw : raw ? [raw] : [];
    this.musculation.set(keys.reduce((acc, key) => acc | (MUSCULATION_FLAGS[key as MusculationKey] ?? 0), 0));
  }

  protected onSubmit(): void {
    if (this.loadingEvaluation()) {
      return;
    }
    if (this.profileForm().invalid() || this.formatForm().invalid()) {
      this.profileForm().markAsTouched();
      this.formatForm().markAsTouched();
      return;
    }
    const p = this.profileModel();
    const f = this.formatModel();
    this.save.emit({
      athleteId: Number(p.athleteId),
      evaluationId: p.evaluationId ? Number(p.evaluationId) : null,
      profile: {
        archetype: p.archetype as Archetype,
        strengthSpeed: p.strengthSpeed as StrengthSpeed,
        technique: p.technique as Technique,
        endurance: p.endurance as Endurance,
        squat: p.squat as ProtocolGoal,
        pull: p.pull as ProtocolGoal,
        musculation: this.musculation(),
        snatch: p.snatch || null,
        clean: p.clean || null,
        jerk: p.jerk || null
      },
      weeks: Number(f.weeks),
      frequency: Number(f.frequency),
      duration: f.duration ? Number(f.duration) : null,
      startDate: f.startDate,
      snatchGoal: Number(f.snatchGoal),
      cjGoal: Number(f.cjGoal)
    });
  }

  /**
   * Fermeture effective du dialogue (garde `wa-after-hide` portée par `app-wizard-dialog`) :
   * rend le focus au déclencheur.
   */
  protected onDialogHide(): void {
    this.close.emit();
    this.opener?.focus();
    this.opener = null;
  }

  /** Écrase les champs de la synthèse avec ceux de l'évaluation (archétype stocké, non recalculé). */
  private applyEvaluation(evaluation: EvaluationDetail): void {
    this.profileModel.update((m) => ({
      ...m,
      strengthSpeed: evaluation.strengthSpeed ?? '',
      technique: evaluation.technique ?? '',
      endurance: evaluation.endurance ?? '',
      archetype: evaluation.archetype ?? '',
      squat: evaluation.squat ?? '',
      pull: evaluation.pull ?? '',
      snatch: evaluation.snatch ?? '',
      clean: evaluation.clean ?? '',
      jerk: evaluation.jerk ?? ''
    }));
    this.musculation.set(evaluation.musculation ?? 0);
  }

  private emptyProfile(): ProfileFormModel {
    return {
      athleteId: '',
      evaluationId: '',
      strengthSpeed: '',
      technique: '',
      endurance: '',
      archetype: '',
      snatch: '',
      clean: '',
      jerk: '',
      squat: '',
      pull: ''
    };
  }

  private emptyFormat(): FormatFormModel {
    return {weeks: '', frequency: '', duration: '', startDate: '', snatchGoal: null, cjGoal: null};
  }

  /** Parse une date ISO `yyyy-MM-dd` en Date locale (évite le décalage UTC). */
  private parseIsoDate(value: string): Date | null {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
    if (!match) {
      return null;
    }
    const [, year, month, day] = match;
    const date = new Date(Number(year), Number(month) - 1, Number(day));
    return Number.isNaN(date.getTime()) ? null : date;
  }

  /** Formate une Date locale en chaîne ISO `yyyy-MM-dd`. */
  private formatIsoDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
