import {
	ChangeDetectionStrategy,
	Component,
	computed,
	CUSTOM_ELEMENTS_SCHEMA,
	effect,
	ElementRef,
	inject,
	signal,
	TemplateRef,
	viewChild
} from '@angular/core';
import {form, FormField} from '@angular/forms/signals';
import {TranslatePipe, TranslateService} from '@ngx-translate/core';
import {DataGridComponent} from '../../components/data-grid/data-grid.component';
import {CellClickEvent, ColumnDef, GridFilter, SortState} from '../../models/data-grid.model';
import {ConfirmDialogComponent} from '../../components/confirm-dialog/confirm-dialog.component';
import {WaSelectControlDirective} from '../../directives/wa-forms/wa-select-control.directive';
import {LocalizedDatePipe} from '../../pipes/localized-date.pipe';
import {ProgrammeCreateRequest, ProgrammeFilter, ProgrammeRow} from '../../models/programme.model';
import {ProgrammeService} from '../../services/programme.service';
import {AthleteService} from '../../services/athlete.service';
import {Athlete, AthleteFilter} from '../../models/athlete.model';
import {ProgrammeCreateDialogComponent} from './programme-create-dialog/programme-create-dialog.component';
import {ProgrammeDetailDialogComponent} from './programme-detail-dialog/programme-detail-dialog.component';

// Composants WebAwesome utilisés (enregistrement ciblé).
import '@awesome.me/webawesome/dist/components/select/select.js';
import '@awesome.me/webawesome/dist/components/option/option.js';
import '@awesome.me/webawesome/dist/components/button/button.js';
import '@awesome.me/webawesome/dist/components/icon/icon.js';
import '@awesome.me/webawesome/dist/components/tag/tag.js';
import '@awesome.me/webawesome/dist/components/dropdown/dropdown.js';
import '@awesome.me/webawesome/dist/components/dropdown-item/dropdown-item.js';
import '@awesome.me/webawesome/dist/components/toast/toast.js';
import type WaToast from '@awesome.me/webawesome/dist/components/toast/toast.js';

/**
 * Écran « Programmes » : liste paginée/filtrée/triée (côté serveur) des programmes
 * d'entraînement générés, avec filtre par athlète. Calqué sur l'écran Archétype,
 * les notifications d'erreur transitoires passant par `<wa-toast>` (learning.md
 * 2026-10-17).
 *
 * Les popups de création (Lot 8) et de détail/édition (Lot 9) ne sont pas encore
 * implémentées : seuls les signaux et handlers d'ouverture sont préparés ici.
 */
@Component({
	selector: 'app-programmes',
	standalone: true,
	imports: [TranslatePipe, FormField, WaSelectControlDirective, DataGridComponent, ConfirmDialogComponent, LocalizedDatePipe, ProgrammeCreateDialogComponent, ProgrammeDetailDialogComponent],
	schemas: [CUSTOM_ELEMENTS_SCHEMA],
	changeDetection: ChangeDetectionStrategy.OnPush,
	templateUrl: './programmes.component.html',
	host: {class: 'flex flex-1 min-h-0'}
})
export class ProgrammesComponent {

	private readonly programmeService = inject(ProgrammeService);
	private readonly athleteService = inject(AthleteService);
	private readonly translate = inject(TranslateService);

	/** Identité d'une ligne du grid : l'identifiant du programme. */
	protected readonly rowId = (row: ProgrammeRow): number => row.programmeId;

	/** Traduction impérative (pour aria-label et messages du toast). */
	protected t(key: string): string {
		return this.translate.instant(key);
	}

	// --- Liste des athlètes (peuple le filtre) ---

	/** Charge TOUS les athlètes (`size = 0`) pour peupler le `<wa-select>` du filtre. */
	private readonly athletesQuery = computed<AthleteFilter & GridFilter>(() => ({
		sexe: null,
		ageCategorie: null,
		page: 0,
		size: 0,
		sort: 'lastName,asc'
	}));

	private readonly athletesResource = this.athleteService.getAll(this.athletesQuery);
	protected readonly athletes = computed<readonly Athlete[]>(() => this.athletesResource.value()?.content ?? []);

	// --- Critères de recherche (pilotent la ressource HTTP) ---

	/** Filtre métier (chaîne vide = tous les athlètes). */
	private readonly filtersModel = signal<{athleteId: string}>({athleteId: ''});

	/** Formulaire de filtres (Signal Forms) — sans validation, source des critères. */
	protected readonly filtersForm = form(this.filtersModel);

	protected readonly page = signal(0);
	protected readonly pageSize = signal(10);
	protected readonly sort = signal<SortState | null>({key: 'startDate', direction: 'desc'});

	/** Filtre métier normalisé (chaîne vide → null, sinon number). */
	private readonly programmeFilter = computed<ProgrammeFilter>(() => {
		const {athleteId} = this.filtersModel();
		return {athleteId: athleteId ? Number(athleteId) : null};
	});

	/** Filtre de grille (pagination + tri). */
	private readonly gridFilter = computed<GridFilter>(() => ({
		page: this.page(),
		size: this.pageSize(),
		sort: this.sort() ? `${this.sort()!.key},${this.sort()!.direction}` : null
	}));

	/** Requête complète : combinaison du filtre métier et du filtre de grille. */
	protected readonly query = computed<ProgrammeFilter & GridFilter>(() => ({
		...this.programmeFilter(),
		...this.gridFilter()
	}));

	/** Ressource réactive : se recharge automatiquement quand `query` change. */
	protected readonly programmesResource = this.programmeService.getAll(this.query);

	protected readonly rows = computed<readonly ProgrammeRow[]>(() => this.programmesResource.value()?.content ?? []);
	protected readonly totalElements = computed(() => this.programmesResource.value()?.totalElements ?? 0);
	protected readonly loading = computed(() => this.programmesResource.isLoading());

	// --- Popups (Lots 8 & 9, non implémentées ici) ---
	protected readonly createOpen = signal(false);
	protected readonly detailOpen = signal(false);
	protected readonly selectedProgrammeId = signal<number | null>(null);

	// --- Confirmation de suppression ---
	protected readonly confirmOpen = signal(false);
	protected readonly rowToDelete = signal<ProgrammeRow | null>(null);

	// --- Toast d'erreur transitoire (learning.md 2026-10-17) ---
	private readonly toast = viewChild<ElementRef<WaToast>>('toast');

	// Templates de cellule déclarés dans le HTML de la page.
	private readonly athleteTpl = viewChild<TemplateRef<{ $implicit: ProgrammeRow }>>('athleteCell');
	private readonly startDateTpl = viewChild<TemplateRef<{ $implicit: ProgrammeRow }>>('startDateCell');
	private readonly weeksTpl = viewChild<TemplateRef<{ $implicit: ProgrammeRow }>>('weeksCell');
	private readonly frequencyTpl = viewChild<TemplateRef<{ $implicit: ProgrammeRow }>>('frequencyCell');
	private readonly snatchGoalTpl = viewChild<TemplateRef<{ $implicit: ProgrammeRow }>>('snatchGoalCell');
	private readonly cjGoalTpl = viewChild<TemplateRef<{ $implicit: ProgrammeRow }>>('cjGoalCell');
	private readonly actionsTpl = viewChild<TemplateRef<{ $implicit: ProgrammeRow }>>('actionsCell');

	/**
	 * Définition des colonnes, dérivée des templates de cellule. Retourne `[]` tant
	 * que les templates ne sont pas disponibles (premier rendu). La colonne athlète
	 * est triée par `athleteLastName` (clé serveur).
	 */
	protected readonly columns = computed<readonly ColumnDef<ProgrammeRow>[]>(() => {
		const athlete = this.athleteTpl();
		const startDate = this.startDateTpl();
		const weeks = this.weeksTpl();
		const frequency = this.frequencyTpl();
		const snatchGoal = this.snatchGoalTpl();
		const cjGoal = this.cjGoalTpl();
		const actions = this.actionsTpl();
		if (!athlete || !startDate || !weeks || !frequency || !snatchGoal || !cjGoal || !actions) {
			return [];
		}
		return [
			{key: 'athleteLastName', headerLabel: 'programmes.list.columns.athlete', cellClass: 'cursor-pointer', sortable: true, hideable: false, align: 'start', cellTemplate: athlete},
			{key: 'startDate', headerLabel: 'programmes.list.columns.startDate', sortable: true, align: 'start', hideable: false, cellTemplate: startDate},
			{key: 'weeks', headerLabel: 'programmes.list.columns.weeks', sortable: true, align: 'center', cellTemplate: weeks},
			{key: 'frequency', headerLabel: 'programmes.list.columns.frequency', sortable: true, align: 'center', cellTemplate: frequency},
			{key: 'snatchGoal', headerLabel: 'programmes.list.columns.snatchGoal', sortable: true, align: 'center', cellTemplate: snatchGoal},
			{key: 'cjGoal', headerLabel: 'programmes.list.columns.cjGoal', sortable: true, align: 'center', cellTemplate: cjGoal},
			{key: 'actions', headerLabel: 'programmes.list.columns.actions', hideable: false, align: 'end', width: '80px', cellTemplate: actions}
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
		this.page.set(0);
	}

	protected onSortChange(sort: SortState): void {
		this.sort.set(sort);
		this.page.set(0);
	}

	// --- Popups ---

	/** Ouvre la popup de génération (Lot 8). */
	protected openCreate(): void {
		this.createOpen.set(true);
	}

	/**
	 * Génère un programme à partir du payload de la popup de création : appelle
	 * l'API, ferme la popup et recharge la liste en cas de succès ; affiche un
	 * `wa-toast` d'erreur (popup conservée) en cas d'échec.
	 */
	protected async onCreate(request: ProgrammeCreateRequest): Promise<void> {
		try {
			await this.programmeService.create(request);
			this.createOpen.set(false);
			this.programmesResource.reload();
		} catch {
			this.showError('programmes.errors.generate');
		}
	}

	/** Ouvre la popup de consultation/édition d'un programme (Lot 9). */
	protected openDetail(row: ProgrammeRow): void {
		this.selectedProgrammeId.set(row.programmeId);
		this.detailOpen.set(true);
	}

	/** Ouvre le détail lors d'un clic sur la cellule « athlète ». */
	protected onCellClick(event: CellClickEvent<ProgrammeRow>): void {
		if (event.column.key === 'athleteLastName') {
			this.openDetail(event.row);
		}
	}

	/** Route l'action choisie dans l'action-menu (souris ou clavier via wa-dropdown). */
	protected onRowAction(row: ProgrammeRow, event: Event): void {
		const detail = (event as CustomEvent<{ item?: Element }>).detail;
		const action = detail?.item?.getAttribute('value');
		if (action === 'edit') {
			this.openDetail(row);
		} else if (action === 'refresh') {
			this.askRefresh(row);
		} else if (action === 'print') {
			this.openPrint(row);
		} else if (action === 'delete') {
			this.askDelete(row);
		}
	}

	/** Ouvre la version imprimable du programme dans un nouvel onglet (RG3). */
	protected openPrint(row: ProgrammeRow): void {
		window.open('/programmes/' + row.programmeId + '/impression', '_blank', 'noopener');
	}

	// --- Actualisation (régénération) ---
	protected readonly confirmRefreshOpen = signal(false);
	protected readonly rowToRefresh = signal<ProgrammeRow | null>(null);
	protected readonly refreshing = signal(false);

	protected askRefresh(row: ProgrammeRow): void {
		this.rowToRefresh.set(row);
		this.confirmRefreshOpen.set(true);
	}

	protected cancelRefresh(): void {
		this.confirmRefreshOpen.set(false);
		this.rowToRefresh.set(null);
	}

	protected async confirmRefresh(): Promise<void> {
		const row = this.rowToRefresh();
		this.confirmRefreshOpen.set(false);
		if (!row || this.refreshing()) {
			return;
		}
		this.refreshing.set(true);
		try {
			await this.programmeService.refresh(row.programmeId);
			this.programmesResource.reload();
			this.showSuccess('programmes.success.refresh');
		} catch {
			this.showError('programmes.errors.refresh');
		} finally {
			this.refreshing.set(false);
			this.rowToRefresh.set(null);
		}
	}

	// --- Suppression ---
	protected askDelete(row: ProgrammeRow): void {
		this.rowToDelete.set(row);
		this.confirmOpen.set(true);
	}

	protected cancelDelete(): void {
		this.confirmOpen.set(false);
		this.rowToDelete.set(null);
	}

	protected async confirmDelete(): Promise<void> {
		const row = this.rowToDelete();
		this.confirmOpen.set(false);
		if (!row) {
			return;
		}
		try {
			await this.programmeService.remove(row.programmeId);
			this.programmesResource.reload();
		} catch {
			this.showError('programmes.errors.delete');
		} finally {
			this.rowToDelete.set(null);
		}
	}

	/** Affiche une notification d'erreur transitoire (wa-toast, variant danger). */
	private showError(key: string): void {
		this.toast()?.nativeElement.create(this.t(key), {variant: 'danger', icon: 'triangle-exclamation'});
	}

	/** Affiche une notification de succès transitoire (wa-toast, variant success). */
	private showSuccess(key: string): void {
		this.toast()?.nativeElement.create(this.t(key), {variant: 'success', icon: 'circle-check'});
	}
}
