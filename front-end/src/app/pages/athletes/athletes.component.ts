import {
	ChangeDetectionStrategy,
	Component,
	computed,
	CUSTOM_ELEMENTS_SCHEMA,
	effect,
	inject,
	linkedSignal,
	signal,
	TemplateRef,
	viewChild
} from '@angular/core';
import {DatePipe} from '@angular/common';
import {FormField, form} from '@angular/forms/signals';
import {TranslatePipe, TranslateService} from '@ngx-translate/core';
import {DataGridComponent} from '../../components/data-grid/data-grid.component';
import {CellClickEvent, ColumnDef, SortState} from '../../components/data-grid/data-grid.types';
import {AthleteFormDialogComponent, AthleteFormMode} from './athlete-form-dialog/athlete-form-dialog.component';
import {ConfirmDialogComponent} from '../../components/confirm-dialog/confirm-dialog.component';
import {WaSelectControlDirective} from '../../components/wa-forms/wa-select-control.directive';
import {AthleteService} from '../../services/athlete.service';
import {AGE_CATEGORIES, Athlete, AthleteQuery, AthleteRequest, PageResponse, SEXES} from '../../models/athlete.model';

// Composants WebAwesome utilisés (enregistrement ciblé).
import '@awesome.me/webawesome/dist/components/select/select.js';
import '@awesome.me/webawesome/dist/components/option/option.js';
import '@awesome.me/webawesome/dist/components/button/button.js';
import '@awesome.me/webawesome/dist/components/icon/icon.js';
import '@awesome.me/webawesome/dist/components/badge/badge.js';
import '@awesome.me/webawesome/dist/components/dropdown/dropdown.js';
import '@awesome.me/webawesome/dist/components/dropdown-item/dropdown-item.js';
import '@awesome.me/webawesome/dist/components/callout/callout.js';

@Component({
  selector: 'app-athletes',
  standalone: true,
  imports: [TranslatePipe, FormField, WaSelectControlDirective, DataGridComponent, AthleteFormDialogComponent, ConfirmDialogComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './athletes.component.html',
  host: {class: 'flex flex-1 min-h-0'},
  providers: [DatePipe]
})
export class AthletesComponent {

  private readonly athleteService = inject(AthleteService);
  private readonly translate = inject(TranslateService);
  private readonly datePipe = inject(DatePipe);

  protected readonly sexes = SEXES;
  protected readonly ageCategories = AGE_CATEGORIES;

  /** Identité d'une ligne du grid : l'identifiant de l'athlète. */
  protected readonly rowId = (athlete: Athlete): number => athlete.athleteId;

  /** Traduction impérative (pour aria-label). */
  protected t(key: string): string {
    return this.translate.instant(key);
  }

  // --- Critères de recherche (pilotent la ressource HTTP) ---

  /** Modèle des filtres (chaînes vides = pas de filtre). */
  private readonly filtersModel = signal({sexe: '', ageCategorie: ''});
  /** Formulaire de filtres (Signal Forms) — sans validation, source des critères. */
  protected readonly filtersForm = form(this.filtersModel);

  protected readonly page = signal(0);
  protected readonly pageSize = signal(10);
  protected readonly sort = signal<SortState | null>({key: 'lastName', direction: 'asc'});

  protected readonly query = computed<AthleteQuery>(() => {
    const {sexe, ageCategorie} = this.filtersModel();
    return {
      sexe: (sexe || null) as AthleteQuery['sexe'],
      ageCategorie: (ageCategorie || null) as AthleteQuery['ageCategorie'],
      page: this.page(),
      size: this.pageSize(),
      sort: this.sort() ? `${this.sort()!.key},${this.sort()!.direction}` : null
    };
  });

  /** Ressource réactive : se recharge automatiquement quand `query` change. */
  protected readonly athletesResource = this.athleteService.createListResource(this.query);

  /**
   * Dernière page reçue, conservée pendant les rechargements. `httpResource`
   * repasse `value()` à `undefined` durant le fetch : on garde la valeur
   * précédente pour éviter que `totalElements` retombe à 0 (ce qui reclamperait
   * la pagination à la page 1 et empêcherait de naviguer).
   */
  private readonly lastPage = linkedSignal<PageResponse<Athlete> | undefined, PageResponse<Athlete> | undefined>({
    source: () => this.athletesResource.value(),
    computation: (value, previous) => value ?? previous?.value
  });

  protected readonly rows = computed<readonly Athlete[]>(() => this.lastPage()?.content ?? []);
  protected readonly totalElements = computed(() => this.lastPage()?.totalElements ?? 0);
  protected readonly loading = computed(() => this.athletesResource.isLoading());

  // --- Modale de formulaire ---
  protected readonly dialogOpen = signal(false);
  protected readonly dialogMode = signal<AthleteFormMode>('create');
  protected readonly selectedAthlete = signal<Athlete | null>(null);

  // --- Confirmation de suppression ---
  protected readonly confirmOpen = signal(false);
  protected readonly athleteToDelete = signal<Athlete | null>(null);

  // --- Message d'erreur (aria-live) ---
  protected readonly errorMessage = signal<string | null>(null);

  // Templates de cellule déclarés dans le HTML de la page.
  private readonly sexeTpl = viewChild<TemplateRef<{ $implicit: Athlete }>>('sexeCell');
  private readonly ageTpl = viewChild<TemplateRef<{ $implicit: Athlete }>>('ageCell');
  private readonly levelTpl = viewChild<TemplateRef<{ $implicit: Athlete }>>('levelCell');
  private readonly actionsTpl = viewChild<TemplateRef<{ $implicit: Athlete }>>('actionsCell');

  /**
   * Définition des colonnes, dérivée des templates de cellule. Retourne `[]` tant
   * que les templates ne sont pas disponibles (premier rendu).
   */
  protected readonly columns = computed<readonly ColumnDef<Athlete>[]>(() => {
    const sexe = this.sexeTpl();
    const age = this.ageTpl();
    const level = this.levelTpl();
    const actions = this.actionsTpl();
    if (!sexe || !age || !level || !actions) {
      return [];
    }
    return [
      {key: 'lastName', headerLabel: 'athletes.fields.name', sortable: true, cellClass: 'cursor-pointer', formatter: (a) => `${a.firstName} ${a.lastName}`},
      {key: 'sexe', headerLabel: 'athletes.fields.sexe', sortable: true, align: 'center', width: '90px', cellTemplate: sexe},
      {key: 'ageCategorie', headerLabel: 'athletes.fields.ageCategorie', sortable: true, align: 'center', width: '120px', cellTemplate: age},
      {key: 'compLevel', headerLabel: 'athletes.fields.compLevel', sortable: true, align: 'center', width: '120px', cellTemplate: level},
      {
        key: 'lastEvaluationDate',
        headerLabel: 'athletes.fields.lastEvaluation',
        align: 'center',
        width: '160px',
        formatter: (a) => a.lastEvaluationDate
          ? (this.datePipe.transform(a.lastEvaluationDate, 'mediumDate') ?? '—')
          : '—'
      },
      {key: 'actions', headerLabel: 'athletes.fields.actions', align: 'end', width: '80px', cellTemplate: actions}
    ];
  });

  constructor() {
    // Revenir à la première page dès que les filtres changent.
    effect(() => {
      this.filtersModel();
      this.page.set(0);
    });
  }

  // --- Pagination / tri (server-side) ---
  protected onPageChange(page: number): void {
    this.page.set(page);
  }

  protected onPageSizeChange(size: number): void {
    this.pageSize.set(size);
    this.page.set(0);
  }

  protected onSortChange(sort: SortState): void {
    this.sort.set(sort);
    this.page.set(0);
  }

  // --- Modale ---
  protected openCreate(): void {
    this.selectedAthlete.set(null);
    this.dialogMode.set('create');
    this.dialogOpen.set(true);
  }

  protected openView(athlete: Athlete): void {
    this.selectedAthlete.set(athlete);
    this.dialogMode.set('view');
    this.dialogOpen.set(true);
  }

  /** Ouvre la fiche en consultation lors d'un clic sur la cellule « nom & prénom ». */
  protected onCellClick(event: CellClickEvent<Athlete>): void {
    if (event.column.key === 'lastName') {
      this.openView(event.row);
    }
  }

  protected switchToEdit(): void {
    this.dialogMode.set('edit');
  }

  protected closeDialog(): void {
    this.dialogOpen.set(false);
  }

  protected async onSave(request: AthleteRequest): Promise<void> {
    this.errorMessage.set(null);
    try {
      const current = this.selectedAthlete();
      if (current) {
        await this.athleteService.update(current.athleteId, request);
      } else {
        await this.athleteService.create(request);
      }
      this.dialogOpen.set(false);
      this.athletesResource.reload();
    } catch {
      this.errorMessage.set('athletes.errors.save');
    }
  }

  // --- Suppression ---
  protected askDelete(athlete: Athlete): void {
    this.athleteToDelete.set(athlete);
    this.confirmOpen.set(true);
  }

  /** Route l'action choisie dans l'action-menu (souris ou clavier via wa-select). */
  protected onRowAction(athlete: Athlete, event: Event): void {
    const detail = (event as CustomEvent<{ item?: Element }>).detail;
    const action = detail?.item?.getAttribute('value');
    if (action === 'delete') {
      this.askDelete(athlete);
    }
  }

  protected cancelDelete(): void {
    this.confirmOpen.set(false);
    this.athleteToDelete.set(null);
  }

  protected async confirmDelete(): Promise<void> {
    const athlete = this.athleteToDelete();
    this.confirmOpen.set(false);
    if (!athlete) {
      return;
    }
    this.errorMessage.set(null);
    try {
      await this.athleteService.delete(athlete.athleteId);
      this.athletesResource.reload();
    } catch {
      this.errorMessage.set('athletes.errors.delete');
    } finally {
      this.athleteToDelete.set(null);
    }
  }
}

