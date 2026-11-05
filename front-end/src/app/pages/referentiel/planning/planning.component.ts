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
import {form} from '@angular/forms/signals';
import {FormField} from '@angular/forms/signals';
import {TranslatePipe, TranslateService} from '@ngx-translate/core';
import {DataGridComponent} from '../../../components/data-grid/data-grid.component';
import {CellClickEvent, ColumnDef, GridFilter, SortState} from '../../../models/data-grid.model';
import {PlanningFormDialogComponent, PlanningFormMode} from './planning-form-dialog/planning-form-dialog.component';
import {ConfirmDialogComponent} from '../../../components/confirm-dialog/confirm-dialog.component';
import {WaSelectControlDirective} from '../../../directives/wa-forms/wa-select-control.directive';
import {PlanningService} from '../../../services/planning.service';
import {
	PlanningFilter,
	RefPlanning,
	RefPlanningRequest,
	TRAINING_ORDERS,
	WEEKS_NUMBERS
} from '../../../models/planning.model';

// Composants WebAwesome utilisés (enregistrement ciblé).
import '@awesome.me/webawesome/dist/components/select/select.js';
import '@awesome.me/webawesome/dist/components/option/option.js';
import '@awesome.me/webawesome/dist/components/button/button.js';
import '@awesome.me/webawesome/dist/components/icon/icon.js';
import '@awesome.me/webawesome/dist/components/tag/tag.js';
import '@awesome.me/webawesome/dist/components/dropdown/dropdown.js';
import '@awesome.me/webawesome/dist/components/dropdown-item/dropdown-item.js';
import '@awesome.me/webawesome/dist/components/callout/callout.js';

@Component({
	selector: 'app-planning',
	standalone: true,
	imports: [TranslatePipe, FormField, WaSelectControlDirective, DataGridComponent, PlanningFormDialogComponent, ConfirmDialogComponent],
	schemas: [CUSTOM_ELEMENTS_SCHEMA],
	changeDetection: ChangeDetectionStrategy.OnPush,
	templateUrl: './planning.component.html',
	host: {class: 'flex flex-1 min-h-0'}
})
export class PlanningComponent {

	private readonly planningService = inject(PlanningService);
	private readonly translate = inject(TranslateService);

	protected readonly weeksNumbers = WEEKS_NUMBERS;
	protected readonly trainingOrders = TRAINING_ORDERS;

	/** Identité d'une ligne du grid : l'identifiant de la ligne de planning. */
	protected readonly rowId = (row: RefPlanning): number => row.refPlanningId;

	/** Traduction impérative (pour aria-label). */
	protected t(key: string): string {
		return this.translate.instant(key);
	}

	// --- Critères de recherche (pilotent la ressource HTTP) ---

	/** Filtre métier (chaînes vides = pas de filtre ; wa-select renvoie des chaînes). */
	private readonly filtersModel = signal<{
		weeksNumbers: string;
		trainingOrder: string;
	}>({weeksNumbers: '', trainingOrder: ''});

	/** Formulaire de filtres (Signal Forms) — sans validation, source des critères. */
	protected readonly filtersForm = form(this.filtersModel);

	protected readonly page = signal(0);
	protected readonly pageSize = signal(10);
	/**
	 * Aucun tri explicite au chargement : le backend applique alors son tri par
	 * défaut composite (format hebdomadaire, n° séance, n° exercice). Un clic sur
	 * un en-tête définit ensuite un tri mono-colonne.
	 */
	protected readonly sort = signal<SortState | null>(null);

	/** Filtre métier normalisé (chaînes vides → null, sinon converties en nombre). */
	private readonly planningFilter = computed<PlanningFilter>(() => {
		const {weeksNumbers, trainingOrder} = this.filtersModel();
		return {
			weeksNumbers: weeksNumbers ? Number(weeksNumbers) : null,
			trainingOrder: trainingOrder ? Number(trainingOrder) : null
		};
	});

	/** Filtre de grille (pagination + tri). */
	private readonly gridFilter = computed<GridFilter>(() => ({
		page: this.page(),
		size: this.pageSize(),
		sort: this.sort() ? `${this.sort()!.key},${this.sort()!.direction}` : null
	}));

	/** Requête complète : combinaison du filtre métier et du filtre de grille. */
	protected readonly query = computed<PlanningFilter & GridFilter>(() => ({
		...this.planningFilter(),
		...this.gridFilter()
	}));

	/** Ressource réactive : se recharge automatiquement quand `query` change. */
	protected readonly planningResource = this.planningService.getAll(this.query);

	protected readonly rows = computed<readonly RefPlanning[]>(() => this.planningResource.value()?.content ?? []);
	protected readonly totalElements = computed(() => this.planningResource.value()?.totalElements ?? 0);
	protected readonly loading = computed(() => this.planningResource.isLoading());

	// --- Modale de formulaire ---
	protected readonly dialogOpen = signal(false);
	protected readonly dialogMode = signal<PlanningFormMode>('create');
	protected readonly selectedRow = signal<RefPlanning | null>(null);

	// --- Confirmation de suppression ---
	protected readonly confirmOpen = signal(false);
	protected readonly rowToDelete = signal<RefPlanning | null>(null);

	// --- Message d'erreur (aria-live) ---
	protected readonly errorMessage = signal<string | null>(null);

	// Templates de cellule déclarés dans le HTML de la page.
	private readonly exerciceTypeTpl = viewChild<TemplateRef<{ $implicit: RefPlanning }>>('exerciceTypeCell');
	private readonly weeksNumbersTpl = viewChild<TemplateRef<{ $implicit: RefPlanning }>>('weeksNumbersCell');
	private readonly trainingOrderTpl = viewChild<TemplateRef<{ $implicit: RefPlanning }>>('trainingOrderCell');
	private readonly actionsTpl = viewChild<TemplateRef<{ $implicit: RefPlanning }>>('actionsCell');

	/**
	 * Définition des colonnes, dérivée des templates de cellule. Retourne `[]` tant
	 * que les templates ne sont pas disponibles (premier rendu).
	 */
	protected readonly columns = computed<readonly ColumnDef<RefPlanning>[]>(() => {
		const weeksNumbers = this.weeksNumbersTpl();
		const trainingOrder = this.trainingOrderTpl();
		const exerciceType = this.exerciceTypeTpl();
		const actions = this.actionsTpl();
		if (!weeksNumbers || !trainingOrder || !exerciceType || !actions) {
			return [];
		}
		return [
			{key: 'weeksNumbers', headerLabel: 'planning.fields.weeksNumbers', cellClass: 'cursor-pointer', sortable: true, hideable: false, align: 'start', cellTemplate: weeksNumbers},
			{key: 'trainingOrder', headerLabel: 'planning.fields.trainingOrder', sortable: true, align: 'start', hideable: false, cellTemplate: trainingOrder},
			{key: 'exerciceOrder', headerLabel: 'planning.fields.exerciceOrder', sortable: true, align: 'start', hideable: false},
			{key: 'exerciceType', headerLabel: 'planning.fields.exerciceType', sortable: true, align: 'start', hideable: false, cellTemplate: exerciceType},
			{key: 'actions', headerLabel: 'planning.fields.actions', hideable: false, align: 'end', width: '80px', cellTemplate: actions}
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

	// --- Modale ---
	protected openCreate(): void {
		this.selectedRow.set(null);
		this.dialogMode.set('create');
		this.dialogOpen.set(true);
	}

	protected openEdit(row: RefPlanning): void {
		this.selectedRow.set(row);
		this.dialogMode.set('edit');
		this.dialogOpen.set(true);
	}

	/** Ouvre la fiche en modification lors d'un clic sur la cellule « format hebdo » ou « catégorie ». */
	protected onCellClick(event: CellClickEvent<RefPlanning>): void {
		if (event.column.key === 'weeksNumbers' || event.column.key === 'exerciceType') {
			this.openEdit(event.row);
		}
	}

	protected closeDialog(): void {
		this.dialogOpen.set(false);
	}

	protected async onSave(request: RefPlanningRequest): Promise<void> {
		this.errorMessage.set(null);
		try {
			const current = this.selectedRow();
			if (current) {
				await this.planningService.update(current.refPlanningId, request);
			} else {
				await this.planningService.create(request);
			}
			this.dialogOpen.set(false);
			this.planningResource.reload();
		} catch {
			this.errorMessage.set('planning.errors.save');
		}
	}

	// --- Suppression ---
	protected askDelete(row: RefPlanning): void {
		this.rowToDelete.set(row);
		this.confirmOpen.set(true);
	}

	/** Route l'action choisie dans l'action-menu (souris ou clavier via wa-dropdown). */
	protected onRowAction(row: RefPlanning, event: Event): void {
		const detail = (event as CustomEvent<{ item?: Element }>).detail;
		const action = detail?.item?.getAttribute('value');
		if (action === 'edit') {
			this.openEdit(row);
		} else if (action === 'delete') {
			this.askDelete(row);
		}
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
		this.errorMessage.set(null);
		try {
			await this.planningService.delete(row.refPlanningId);
			this.planningResource.reload();
		} catch {
			this.errorMessage.set('planning.errors.delete');
		} finally {
			this.rowToDelete.set(null);
		}
	}
}
