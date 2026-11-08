import {
  ChangeDetectionStrategy,
  Component,
  computed,
  CUSTOM_ELEMENTS_SCHEMA,
  effect,
  inject,
  input,
  output,
  signal
} from '@angular/core';
import {TranslatePipe, TranslateService} from '@ngx-translate/core';
import {form, FormField, min, required} from '@angular/forms/signals';
import {WaSelectControlDirective} from '../../../directives/wa-forms/wa-select-control.directive';
import {WaInputControlDirective} from '../../../directives/wa-forms/wa-input-control.directive';
import {WaNumberInputControlDirective} from '../../../directives/wa-forms/wa-number-input-control.directive';
import {WaFieldErrorDirective} from '../../../directives/wa-forms/wa-field-error.directive';
import {LocalizedDatePipe} from '../../../pipes/localized-date.pipe';
import {
  DURATION_OPTIONS,
  FREQUENCY_OPTIONS,
  ProgrammeCreateRequest,
  WEEKS_OPTIONS
} from '../../../models/programme.model';
import {Athlete, AthleteFilter} from '../../../models/athlete.model';
import {Evaluation} from '../../../models/evaluation.model';
import {GridFilter} from '../../../models/data-grid.model';
import {AthleteService} from '../../../services/athlete.service';
import {EvaluationService} from '../../../services/evaluation.service';

// Composants WebAwesome utilisés (enregistrement ciblé).
import '@awesome.me/webawesome/dist/components/dialog/dialog.js';
import '@awesome.me/webawesome/dist/components/select/select.js';
import '@awesome.me/webawesome/dist/components/option/option.js';
import '@awesome.me/webawesome/dist/components/input/input.js';
import '@awesome.me/webawesome/dist/components/button/button.js';

/**
 * Modèle interne du formulaire de création. Les valeurs de listes déroulantes et la
 * date sont des chaînes pour s'interfacer directement avec les value accessors
 * WebAwesome (`<wa-select>` / `<wa-input type="date">`). Les objectifs numériques
 * (`snatchGoal` / `cjGoal`) sont typés `number | null` pour permettre la validation
 * `min` et s'interfacer avec {@link WaNumberInputControlDirective}. La conversion
 * finale (string → number) des listes déroulantes est faite à l'émission.
 */
interface CreateFormModel {
  athleteId: string;
  evaluationId: string;
  weeks: string;
  frequency: string;
  duration: string;
  startDate: string;
  snatchGoal: number | null;
  cjGoal: number | null;
}

/**
 * Modale de création (= génération) d'un programme d'entraînement.
 *
 * L'utilisateur choisit un athlète, l'une de ses évaluations, puis les paramètres
 * du programme (durée en semaines, fréquence, date de début, durée de séance
 * optionnelle, objectifs arraché / épaulé-jeté). La **date de fin** est calculée
 * automatiquement (`startDate + weeks*7 - 1`) et présentée en lecture seule : elle
 * n'est pas soumise (le backend la recalcule).
 *
 * Dépendance Athlète → Évaluation : la liste des évaluations est filtrée côté
 * client par l'athlète courant ; changer d'athlète réinitialise l'évaluation
 * sélectionnée pour éviter de soumettre une évaluation d'un autre athlète.
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
    WaFieldErrorDirective
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

  protected readonly weeksOptions = WEEKS_OPTIONS;
  protected readonly frequencyOptions = FREQUENCY_OPTIONS;
  protected readonly durationOptions = DURATION_OPTIONS;

  // --- Listes déroulantes (chargées une fois, size=0) ---

  /** Charge TOUS les athlètes pour le select Athlète. */
  private readonly athletesQuery = computed<AthleteFilter & GridFilter>(() => ({
    sexe: null,
    ageCategorie: null,
    page: 0,
    size: 0,
    sort: 'lastName,asc'
  }));

  private readonly athletesResource = this.athleteService.getAll(this.athletesQuery);
  protected readonly athletes = computed<readonly Athlete[]>(() => this.athletesResource.value()?.content ?? []);

  /** Charge TOUTES les évaluations (filtrage par athlète effectué côté client). */
  private readonly evaluationsQuery = computed<GridFilter>(() => ({
    page: 0,
    size: 0,
    sort: 'evaluationDate,desc'
  }));

  private readonly evaluationsResource = this.evaluationService.getAll(this.evaluationsQuery);
  protected readonly evaluations = computed<readonly Evaluation[]>(() => this.evaluationsResource.value()?.content ?? []);

  /** Source de vérité du formulaire. */
  protected readonly model = signal<CreateFormModel>(this.emptyModel());

  /**
   * Formulaire Signal Forms. Tous les champs sont requis sauf la durée de séance.
   * Les objectifs arraché / épaulé-jeté doivent être strictement positifs.
   */
  protected readonly createForm = form(this.model, (path) => {
    required(path.athleteId, {message: 'programmes.create.errors.athlete'});
    required(path.evaluationId, {message: 'programmes.create.errors.evaluation'});
    required(path.weeks, {message: 'programmes.create.errors.weeks'});
    required(path.frequency, {message: 'programmes.create.errors.frequency'});
    required(path.startDate, {message: 'programmes.create.errors.startDate'});
    required(path.snatchGoal, {message: 'programmes.create.errors.snatchGoal'});
    min(path.snatchGoal, 1, {message: 'programmes.create.errors.snatchGoalMin'});
    required(path.cjGoal, {message: 'programmes.create.errors.cjGoal'});
    min(path.cjGoal, 1, {message: 'programmes.create.errors.cjGoalMin'});
  });

  protected readonly title = computed(() => 'programmes.create.title');

  /** Évaluations de l'athlète sélectionné (filtrage client, volumes faibles). */
  protected readonly evaluationsForAthlete = computed<readonly Evaluation[]>(() => {
    const athleteId = this.model().athleteId;
    if (!athleteId) {
      return [];
    }
    const id = Number(athleteId);
    return this.evaluations().filter((e) => e.athleteId === id);
  });

  /**
   * Date de fin calculée en lecture seule : `startDate + weeks*7 - 1 jour`.
   * Chaîne vide si la date de début ou le nombre de semaines n'est pas renseigné.
   */
  protected readonly endDate = computed<string>(() => {
    const {startDate, weeks} = this.model();
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

  constructor() {
    // Réinitialise le formulaire à chaque (ré)ouverture de la modale.
    effect(() => {
      this.open();
      this.model.set(this.emptyModel());
    });

    // Dépendance Athlète → Évaluation : si l'athlète change et que l'évaluation
    // sélectionnée n'appartient plus à cet athlète, on réinitialise l'évaluation.
    effect(() => {
      const current = this.model();
      if (!current.evaluationId) {
        return;
      }
      const stillValid = this.evaluationsForAthlete().some(
        (e) => String(e.evaluationId) === current.evaluationId
      );
      if (!stillValid) {
        this.model.update((m) => ({...m, evaluationId: ''}));
      }
    });
  }

  /** Traduit une clé i18n de manière impérative (pour aria-label). */
  protected t(key: string): string {
    return this.translate.instant(key);
  }

  protected onSubmit(): void {
    if (this.createForm().invalid()) {
      this.createForm().markAsTouched();
      return;
    }
    const m = this.model();
    this.save.emit({
      evaluationId: Number(m.evaluationId),
      weeks: Number(m.weeks),
      frequency: Number(m.frequency),
      duration: m.duration ? Number(m.duration) : null,
      startDate: m.startDate,
      snatchGoal: Number(m.snatchGoal),
      cjGoal: Number(m.cjGoal)
    });
  }

  protected onClose(): void {
    this.close.emit();
  }

  /**
   * Ferme la modale uniquement si l'événement provient bien du dialog lui-même.
   * Les composants `<wa-select>` internes émettent aussi `wa-after-hide` (bubbling)
   * lors de leur propre fermeture : on ignore ces événements enfants.
   */
  protected onDialogHide(event: Event): void {
    if (event.target === event.currentTarget) {
      this.onClose();
    }
  }

  private emptyModel(): CreateFormModel {
    return {
      athleteId: '',
      evaluationId: '',
      weeks: '',
      frequency: '',
      duration: '',
      startDate: '',
      snatchGoal: null,
      cjGoal: null
    };
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
