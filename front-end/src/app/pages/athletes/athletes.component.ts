import {
	ChangeDetectionStrategy,
	Component,
	computed,
	CUSTOM_ELEMENTS_SCHEMA,
	effect,
	inject,
	signal,
	TemplateRef,
	viewChild
} from '@angular/core';
import {DatePipe} from '@angular/common';
import {FormField, form} from '@angular/forms/signals';
import {TranslatePipe, TranslateService} from '@ngx-translate/core';
import {DataGridComponent} from '../../components/data-grid/data-grid.component';
import {CellClickEvent, ColumnDef, GridFilter, SortState} from '../../models/data-grid.model';
import {AthleteFormDialogComponent, AthleteFormMode} from './athlete-form-dialog/athlete-form-dialog.component';
import {ConfirmDialogComponent} from '../../components/confirm-dialog/confirm-dialog.component';
import {WaSelectControlDirective} from '../../directives/wa-forms/wa-select-control.directive';
import {AthleteService} from '../../services/athlete.service';
import {AGE_CATEGORIES, AgeCategorie, Athlete, AthleteFilter, AthleteRequest, Sexe, SEXES} from '../../models/athlete.model';

// Composants WebAwesome utilisés (enregistrement ciblé).
import '@awesome.me/webawesome/dist/components/select/select.js';
import '@awesome.me/webawesome/dist/components/option/option.js';
import '@awesome.me/webawesome/dist/components/button/button.js';
import '@awesome.me/webawesome/dist/components/icon/icon.js';
import '@awesome.me/webawesome/dist/components/tooltip/tooltip.js';
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

  /** Filtre métier (chaînes vides = pas de filtre). */
  private readonly filtersModel = signal<{ sexe: Sexe | ''; ageCategorie: AgeCategorie | '' }>({sexe: '', ageCategorie: ''});
  /** Formulaire de filtres (Signal Forms) — sans validation, source des critères. */
  protected readonly filtersForm = form(this.filtersModel);

  protected readonly page = signal(0);
  protected readonly pageSize = signal(10);
  protected readonly sort = signal<SortState | null>({key: 'lastName', direction: 'asc'});

  /** Filtre métier normalisé (chaînes vides → null). */
  private readonly athleteFilter = computed<AthleteFilter>(() => {
    const {sexe, ageCategorie} = this.filtersModel();
    return {
      sexe: sexe || null,
      ageCategorie: ageCategorie || null
    };
  });

  /** Filtre de grille (pagination + tri). */
  private readonly gridFilter = computed<GridFilter>(() => ({
    page: this.page(),
    size: this.pageSize(),
    sort: this.sort() ? `${this.sort()!.key},${this.sort()!.direction}` : null
  }));

  /** Requête complète : combinaison du filtre métier et du filtre de grille. */
  protected readonly query = computed<AthleteFilter & GridFilter>(() => ({
    ...this.athleteFilter(),
    ...this.gridFilter()
  }));

  /** Ressource réactive : se recharge automatiquement quand `query` change. */
  protected readonly athletesResource = this.athleteService.getAll(this.query);

  protected readonly rows = computed<readonly Athlete[]>(() => this.athletesResource.value()?.content ?? []);
  protected readonly totalElements = computed(() => this.athletesResource.value()?.totalElements ?? 0);
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
  protected onPageSizeChange(): void {
    // Le grid a déjà mis à jour `pageSize` (double binding) ; on revient page 1.
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

  protected openEdit(athlete: Athlete): void {
    this.selectedAthlete.set(athlete);
    this.dialogMode.set('edit');
    this.dialogOpen.set(true);
  }

  /** Ouvre la fiche en modification lors d'un clic sur la cellule « nom & prénom ». */
  protected onCellClick(event: CellClickEvent<Athlete>): void {
    if (event.column.key === 'lastName') {
      this.openEdit(event.row);
    }
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

