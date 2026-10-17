import {ChangeDetectionStrategy, Component, computed, CUSTOM_ELEMENTS_SCHEMA, inject, signal} from '@angular/core';
import {TranslatePipe} from '@ngx-translate/core';
import {AthleteService} from '../../../../services/athlete.service';
import {Athlete, AthleteFilter} from '../../../../models/athlete.model';
import {GridFilter} from '../../../../models/data-grid.model';

// Composants WebAwesome utilisés (enregistrement ciblé).
import '@awesome.me/webawesome/dist/components/select/select.js';
import '@awesome.me/webawesome/dist/components/option/option.js';
import '@awesome.me/webawesome/dist/components/input/input.js';

/** Renvoie la date du jour au format ISO (yyyy-MM-dd), en heure locale. */
function todayIso(): string {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  return new Date(now.getTime() - offset * 60_000).toISOString().slice(0, 10);
}

/**
 * Première étape du wizard d'évaluation : choix de l'athlète évalué et de la
 * date (par défaut la date du jour).
 *
 * Comme l'étape Synthèse, elle n'implémente pas {@link EvalWizardStep} (dont la
 * valeur est un `EvalDetail[]`) : elle expose directement l'athlète sélectionné,
 * la date et sa validité, consommés par la modale lors de la validation finale.
 */
@Component({
  selector: 'app-eval-wizard-athlete',
  standalone: true,
  imports: [TranslatePipe],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './eval-wizard-athlete.component.html'
})
export class EvalWizardAthleteComponent {

  private readonly athleteService = inject(AthleteService);

  /** Filtre : tous les athlètes, non paginés, triés nom puis prénom. */
  private readonly query = signal<AthleteFilter & GridFilter>({
    sexe: null,
    ageCategorie: null,
    page: 0,
    size: 0,
    sort: 'lastName,asc'
  });

  private readonly athletesResource = this.athleteService.getAll(this.query);

  /** Athlètes disponibles pour la liste déroulante (Nom Prénom, ordre alpha). */
  protected readonly athletes = computed<readonly Athlete[]>(
    () => this.athletesResource.value()?.content ?? []
  );

  /** Identifiant de l'athlète sélectionné (null tant que non choisi). */
  readonly athleteId = signal<number | null>(null);

  /** Date d'évaluation (ISO), initialisée à aujourd'hui. */
  readonly evaluationDate = signal<string>(todayIso());

  /** Validité de l'étape : un athlète et une date sont requis. */
  readonly valid = computed<boolean>(() => this.athleteId() != null && !!this.evaluationDate());

  /** Réinitialise la sélection (athlète vide, date du jour). */
  reset(): void {
    this.athleteId.set(null);
    this.evaluationDate.set(todayIso());
  }

  /** Pré-remplit l'athlète et la date (édition d'une évaluation existante). */
  load(athleteId: number, evaluationDate: string): void {
    this.athleteId.set(athleteId);
    this.evaluationDate.set(evaluationDate);
  }

  protected onAthlete(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.athleteId.set(value ? Number(value) : null);
  }

  protected onDate(event: Event): void {
    this.evaluationDate.set((event.target as HTMLInputElement).value);
  }

  /** Conversion number -> string pour les attributs de template. */
  protected str(value: number | null): string {
    return value != null ? String(value) : '';
  }
}
