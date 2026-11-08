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
	TemplateRef,
	viewChild,
	viewChildren
} from '@angular/core';
import {TranslatePipe, TranslateService} from '@ngx-translate/core';
import {LocalizedDatePipe} from '../../../pipes/localized-date.pipe';
import {
	ProgrammeCellUpdateRequest,
	ProgrammeDetail,
	ProgrammeExercice,
	ProgrammeWeek
} from '../../../models/programme.model';
import {ProgrammeService} from '../../../services/programme.service';
import {ProgrammeCellDialogComponent} from '../programme-cell-dialog/programme-cell-dialog.component';
import {DataGridComponent} from '../../../components/data-grid/data-grid.component';
import {CellClickEvent, ColumnDef} from '../../../models/data-grid.model';

// Composants WebAwesome utilisés (enregistrement ciblé).
import '@awesome.me/webawesome/dist/components/dialog/dialog.js';
import '@awesome.me/webawesome/dist/components/select/select.js';
import '@awesome.me/webawesome/dist/components/option/option.js';
import '@awesome.me/webawesome/dist/components/button/button.js';
import '@awesome.me/webawesome/dist/components/toast/toast.js';
import type WaToast from '@awesome.me/webawesome/dist/components/toast/toast.js';

/** Option du sélecteur de semaines. */
export interface WeekOption {
  readonly weekNumber: number;
  readonly startDate: string;
  readonly endDate: string;
}

/** Payload émis au clic sur une cellule (consommé par la popup d'édition). */
export interface EditCellEvent {
  readonly weekNumber: number;
  readonly trainingNumber: number;
  readonly exerciceOrder: number;
  readonly exercices: readonly ProgrammeExercice[];
}

/**
 * Ligne de la grille de détail = une **position d'exercice** (`exerciceOrder`)
 * commune à toutes les séances de la semaine.
 *
 * NB : le champ `exercices` ne contient PAS des exercices mais la liste des
 * **cellules** de la ligne (une par séance `trainingNumber`). Le nom est
 * conservé tel que fixé par l'utilisateur, d'où ce commentaire clarifiant.
 */
export interface ProgrammeGridRow {
	readonly exerciceOrder: number;
	/** Cellules de la ligne, une par séance de la semaine (triées par trainingNumber). */
	readonly exercices: readonly ProgrammeGridCell[];
}

/**
 * Cellule de la grille = intersection d'une séance (`trainingNumber`) et d'une
 * position (`exerciceOrder`). Elle regroupe les **exercices alternatifs**
 * (« au choix ») de cette séance à cette position.
 *
 * Choix de typage : on conserve directement les {@link ProgrammeExercice}
 * d'origine (pas de `CellExercice`). Raison : `ProgrammeExercice` porte déjà tous
 * les champs nécessaires à l'affichage (nom + séries), et {@link EditCellEvent}
 * attend précisément `readonly ProgrammeExercice[]`. Garder une seule
 * représentation évite une conversion et une divergence de types entre affichage
 * et édition ; la conversion vers `CellExercice`/`CellSeries` est faite par la
 * popup d'édition au moment de bâtir le `ProgrammeCellUpdateRequest`.
 */
export interface ProgrammeGridCell {
	readonly trainingNumber: number;
	readonly exerciceOrder: number;
	readonly exercices: readonly ProgrammeExercice[];
}

/**
 * Modale de **consultation / édition** d'un programme d'entraînement.
 *
 * Elle charge elle-même le détail du programme ({@link ProgrammeService.getDetail})
 * dès qu'elle est ouverte avec un identifiant. Un sélecteur de semaines permet de
 * naviguer entre les semaines ; chaque semaine est présentée via un en-tête
 * (type / base % / 6 objectifs) et une **grille pivot** calquée sur l'écran Planning
 * (colonnes = séances `trainingNumber`, lignes = positions `exerciceOrder`).
 *
 * Chaque cellule regroupe les **exercices alternatifs** (« au choix ») de la séance
 * à une position donnée ; chaque exercice affiche son nom une seule fois puis ses
 * **séries empilées**. Un clic sur une cellule émet {@link EditCellEvent} et ouvre la
 * popup d'édition locale `app-programme-cell-dialog`.
 */
@Component({
  selector: 'app-programme-detail-dialog',
  standalone: true,
  imports: [TranslatePipe, ProgrammeCellDialogComponent, DataGridComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './programme-detail-dialog.component.html',
  providers: [LocalizedDatePipe]
})
export class ProgrammeDetailDialogComponent {

  private readonly programmeService = inject(ProgrammeService);
  private readonly translate = inject(TranslateService);
  private readonly localizedDate = inject(LocalizedDatePipe);

  readonly open = input<boolean>(false);
  readonly programmeId = input<number | null>(null);

  readonly close = output<void>();
  /**
   * Émis au clic sur une cellule (conservé pour un éventuel câblage parent).
   * L'édition est traitée **localement** via la popup `app-programme-cell-dialog`
   * intégrée à ce composant : il possède déjà le contexte (programmeId, semaine) et
   * peut se rafraîchir lui-même après la mise à jour.
   */
  readonly editCell = output<EditCellEvent>();

  /** Cellule en cours d'édition (null tant qu'aucune cellule n'est ouverte). */
  protected readonly editingCell = signal<EditCellEvent | null>(null);
  /** Ouverture de la popup d'édition de cellule. */
  protected readonly cellDialogOpen = signal(false);

  /** Détail du programme en cours de consultation (null tant que non chargé). */
  protected readonly detail = signal<ProgrammeDetail | null>(null);
  protected readonly loading = signal(false);

  /** Numéro de la semaine affichée (réinitialisé à 1 au chargement d'un détail). */
  protected readonly selectedWeekNumber = signal<number>(1);

  private readonly errorToast = viewChild<ElementRef<WaToast>>('errorToast');

  /** Titre de la modale (inclut le nom de l'athlète si le détail est chargé). */
  protected readonly athleteName = computed<string>(() => {
    const d = this.detail();
    return d ? `${d.athleteLastName} ${d.athleteFirstName}` : '';
  });

  /** Options du sélecteur de semaines, triées par numéro croissant. */
  protected readonly weekOptions = computed<readonly WeekOption[]>(() => {
    const d = this.detail();
    if (!d) {
      return [];
    }
    return [...d.programmeWeeks]
      .sort((a, b) => a.weekNumber - b.weekNumber)
      .map((w) => ({weekNumber: w.weekNumber, startDate: w.startDate, endDate: w.endDate}));
  });

  /** Semaine actuellement sélectionnée (ou null si introuvable). */
  protected readonly selectedWeek = computed<ProgrammeWeek | null>(() => {
    const d = this.detail();
    if (!d) {
      return null;
    }
    return d.programmeWeeks.find((w) => w.weekNumber === this.selectedWeekNumber()) ?? null;
  });

	/**
	 * Numéros de séance de la semaine sélectionnée, triés croissant. Pilote À LA FOIS
	 * le `@for` générant un `<ng-template #seanceCell>` par séance (dans le HTML) ET
	 * la construction des colonnes séances, afin de garantir le MÊME ordre : la i-ème
	 * colonne séance reçoit le i-ème template.
	 */
	protected readonly trainingNumbers = computed<readonly number[]>(() => {
		const week = this.selectedWeek();
		if (!week) {
			return [];
		}
		return [...new Set(week.trainings.map((trn) => trn.trainingNumber))].sort((a, b) => a - b);
	});

	/**
	 * Lignes de la grille (une par `exerciceOrder` distinct, triées croissant).
	 * Pour chaque ligne, une cellule par séance regroupe les exercices alternatifs
	 * de cette séance à cette position (plusieurs = « au choix », RG3).
	 */
	protected readonly rows = computed<readonly ProgrammeGridRow[]>(() => {
		const week = this.selectedWeek();
		if (!week) {
			return [];
		}
		const trainingNumbers = this.trainingNumbers();
		// Positions distinctes (toutes séances confondues), triées croissant.
		const orders = [...new Set(
			week.trainings.flatMap((trn) => trn.exercices.map((ex) => ex.exerciceOrder))
		)].sort((a, b) => a - b);

		return orders.map((exerciceOrder) => ({
			exerciceOrder,
			exercices: trainingNumbers.map((trainingNumber) => {
				const training = week.trainings.find((trn) => trn.trainingNumber === trainingNumber);
				const exercices = (training?.exercices ?? [])
					.filter((ex) => ex.exerciceOrder === exerciceOrder);
				return {trainingNumber, exerciceOrder, exercices} satisfies ProgrammeGridCell;
			})
		} satisfies ProgrammeGridRow));
	});

	/**
	 * Template de la 1re colonne (« Exercice N » par ligne). Reçoit la LIGNE.
	 */
	private readonly exerciceOrderCell = viewChild<TemplateRef<{ $implicit: ProgrammeGridRow }>>('exerciceOrderCell');

	/**
	 * Templates de cellule des colonnes séances, un par séance. Chaque template est
	 * généré par un `@for (tn of trainingNumbers())` dans le HTML et capture SON
	 * `trainingNumber` par closure lexicale ; la i-ème entrée correspond donc à la
	 * i-ème séance de {@link trainingNumbers}.
	 */
	private readonly seanceCells = viewChildren<TemplateRef<{ $implicit: ProgrammeGridRow }>>('seanceCell');

	/**
	 * Définition des colonnes de la grille. Retourne `[]` tant que les templates ne
	 * sont pas disponibles (premier rendu) ou tant que le nombre de templates séance
	 * ne correspond pas au nombre de séances — pattern aligné sur `protocoles`.
	 *
	 * NB i18n : le data-grid applique `headerLabel | translate`. Pour la 1re colonne,
	 * `headerLabel` est une clé i18n classique. Pour les colonnes séances, l'en-tête
	 * doit porter le numéro de séance (`Séance {{value}}`) ; `translate` du header
	 * n'accepte pas de paramètres, on fournit donc une chaîne DÉJÀ traduite via
	 * `translate.instant(..., {value})`. Le data-grid la repasse dans `translate` :
	 * comme ce n'est pas une clé connue, `translate` la renvoie telle quelle.
	 */
	protected readonly columns = computed<readonly ColumnDef<ProgrammeGridRow>[]>(() => {
		const orderCell = this.exerciceOrderCell();
		const seanceCells = this.seanceCells();
		const trainingNumbers = this.trainingNumbers();
		if (!orderCell || seanceCells.length !== trainingNumbers.length) {
			return [];
		}
		const firstColumn: ColumnDef<ProgrammeGridRow> = {
			key: 'exerciceOrder',
			headerLabel: 'programmes.detail.grid.exerciceOrderHeader',
			hideable: false,
			align: 'start',
			cellTemplate: orderCell
		};
		const seanceColumns: ColumnDef<ProgrammeGridRow>[] = trainingNumbers.map((trainingNumber, index) => ({
			key: `training-${trainingNumber}`,
			// Chaîne déjà traduite (cf. NB i18n ci-dessus).
			headerLabel: this.translate.instant('programmes.detail.grid.trainingHeader', {value: trainingNumber}),
			hideable: false,
			align: 'start',
			cellClass: 'cursor-pointer',
			cellTemplate: seanceCells[index]
		}));
		return [firstColumn, ...seanceColumns];
	});

  constructor() {
    // Charge le détail à chaque ouverture avec un identifiant valide.
    effect(() => {
      const id = this.programmeId();
      if (this.open() && id !== null) {
        void this.load(id);
      }
    });
  }

  /** Traduit une clé i18n de manière impérative (pour aria-label et messages). */
  protected t(key: string): string {
    return this.translate.instant(key);
  }

  /** Cellule d'une ligne pour une séance donnée (template séance). */
  protected cellFor(row: ProgrammeGridRow, trainingNumber: number): ProgrammeGridCell | null {
    return row.exercices.find((c) => c.trainingNumber === trainingNumber) ?? null;
  }

  /** Formate une date selon la langue active (sélecteur de semaines). */
  protected formatDate(value: string): string {
    return this.localizedDate.transform(value) ?? value;
  }

  /** Change la semaine affichée (valeur `<wa-select>` reçue en string). */
  protected onWeekChange(value: string): void {
    const weekNumber = Number(value);
    if (!Number.isNaN(weekNumber)) {
      this.selectedWeekNumber.set(weekNumber);
    }
  }

  /**
   * Clic sur une cellule de la grille. La 1re colonne (position d'exercice) n'est
   * pas éditable. Pour une colonne séance, on résout le `trainingNumber` depuis la
   * clé de colonne (`training-<n>`), on récupère la cellule correspondante de la
   * ligne, puis on émet {@link EditCellEvent} et on ouvre la popup d'édition locale.
   */
  protected onCellClick(event: CellClickEvent<ProgrammeGridRow>): void {
    if (event.column.key === 'exerciceOrder') {
      return;
    }
    const trainingNumber = Number(event.column.key.replace('training-', ''));
    if (Number.isNaN(trainingNumber)) {
      return;
    }
    const cell = event.row.exercices.find((c) => c.trainingNumber === trainingNumber);
    const editEvent: EditCellEvent = {
      weekNumber: this.selectedWeekNumber(),
      trainingNumber,
      exerciceOrder: event.row.exerciceOrder,
      exercices: cell?.exercices ?? []
    };
    this.editingCell.set(editEvent);
    this.editCell.emit(editEvent);
    this.cellDialogOpen.set(true);
  }

  /**
   * met à jour le détail avec la réponse (en conservant la semaine sélectionnée) et
   * ferme la popup. En cas d'échec : toast d'erreur, popup conservée.
   */
  protected async onCellSave(request: ProgrammeCellUpdateRequest): Promise<void> {
    const id = this.programmeId();
    if (id === null) {
      return;
    }
    try {
      const detail = await this.programmeService.updateCell(id, request);
      this.detail.set(detail);
      this.cellDialogOpen.set(false);
    } catch {
      this.showError('programmes.cell.errors.save');
    }
  }

  protected onClose(): void {
    this.close.emit();
  }

  /**
   * Ferme la modale uniquement si l'événement provient bien du dialog lui-même.
   * Les `<wa-select>` internes émettent aussi `wa-after-hide` (bubbling) : on ignore
   * ces événements enfants.
   */
  protected onDialogHide(event: Event): void {
    if (event.target === event.currentTarget) {
      this.onClose();
    }
  }

  /**
   * Recharge le détail du programme en conservant la semaine sélectionnée.
   * Appelable par le parent après une édition de cellule (Lot 10).
   */
  async reload(): Promise<void> {
    const id = this.programmeId();
    if (id === null) {
      return;
    }
    const current = this.selectedWeekNumber();
    await this.load(id, current);
  }

  /** Charge le détail ; `keepWeek` conserve la semaine affichée (défaut : 1re semaine). */
  private async load(id: number, keepWeek?: number): Promise<void> {
    this.loading.set(true);
    try {
      const detail = await this.programmeService.getDetail(id);
      this.detail.set(detail);
      const available = detail.programmeWeeks.map((w) => w.weekNumber);
      const target = keepWeek !== undefined && available.includes(keepWeek)
        ? keepWeek
        : (available.length > 0 ? Math.min(...available) : 1);
      this.selectedWeekNumber.set(target);
    } catch {
      this.detail.set(null);
      this.showError('programmes.detail.errors.load');
    } finally {
      this.loading.set(false);
    }
  }

  /** Affiche une notification d'erreur transitoire (wa-toast, variant danger). */
  private showError(key: string): void {
    this.errorToast()?.nativeElement.create(this.t(key), {variant: 'danger', icon: 'triangle-exclamation'});
  }
}
