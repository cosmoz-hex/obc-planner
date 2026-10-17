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
import {DecimalPipe} from '@angular/common';
import {TranslatePipe, TranslateService} from '@ngx-translate/core';
import {DataGridComponent} from '../../../components/data-grid/data-grid.component';
import {CellClickEvent, ColumnDef, GridFilter, SortState} from '../../../models/data-grid.model';
import {ExerciceFormDialogComponent, ExerciceFormMode} from './exercice-form-dialog/exercice-form-dialog.component';
import {ConfirmDialogComponent} from '../../../components/confirm-dialog/confirm-dialog.component';
import {WaSelectControlDirective} from '../../../directives/wa-forms/wa-select-control.directive';
import {ExerciceService} from '../../../services/exercice.service';
import {
	CATEGORIE_EXERCICES,
	CategorieExercice,
	Exercice,
	ExerciceFilter,
	ExerciceRequest,
	TYPE_EXERCICES,
	TypeExercice
} from '../../../models/exercice.model';

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
	selector: 'app-exercices',
	standalone: true,
	imports: [TranslatePipe, DecimalPipe, FormField, WaSelectControlDirective, DataGridComponent, ExerciceFormDialogComponent, ConfirmDialogComponent],
	schemas: [CUSTOM_ELEMENTS_SCHEMA],
	changeDetection: ChangeDetectionStrategy.OnPush,
	templateUrl: './exercices.component.html',
	host: {class: 'flex flex-1 min-h-0'}
})
export class ExercicesComponent {

	private readonly exerciceService = inject(ExerciceService);
	private readonly translate = inject(TranslateService);

	protected readonly typeExercices = TYPE_EXERCICES;
	protected readonly categorieExercices = CATEGORIE_EXERCICES;

	/** Identité d'une ligne du grid : l'identifiant de l'exercice. */
	protected readonly rowId = (row: Exercice): number => row.exerciceId;

	/** Traduction impérative (pour aria-label). */
	protected t(key: string): string {
		return this.translate.instant(key);
	}

	// --- Critères de recherche (pilotent la ressource HTTP) ---

	/** Filtre métier (chaînes vides = pas de filtre). */
	private readonly filtersModel = signal<{
		typeExercice: TypeExercice | '';
		categorieExercice: CategorieExercice | '';
	}>({typeExercice: '', categorieExercice: ''});

	/** Formulaire de filtres (Signal Forms) — sans validation, source des critères. */
	protected readonly filtersForm = form(this.filtersModel);

	protected readonly page = signal(0);
	protected readonly pageSize = signal(10);
	protected readonly sort = signal<SortState | null>({key: 'typeExercice', direction: 'asc'});

	/** Filtre métier normalisé (chaînes vides → null). */
	private readonly exerciceFilter = computed<ExerciceFilter>(() => {
		const {typeExercice, categorieExercice} = this.filtersModel();
		return {
			typeExercice: typeExercice || null,
			categorieExercice: categorieExercice || null
		};
	});

	/** Filtre de grille (pagination + tri). */
	private readonly gridFilter = computed<GridFilter>(() => ({
		page: this.page(),
		size: this.pageSize(),
		sort: this.sort() ? `${this.sort()!.key},${this.sort()!.direction}` : null
	}));

	/** Requête complète : combinaison du filtre métier et du filtre de grille. */
	protected readonly query = computed<ExerciceFilter & GridFilter>(() => ({
		...this.exerciceFilter(),
		...this.gridFilter()
	}));

	/** Ressource réactive : se recharge automatiquement quand `query` change. */
	protected readonly exercicesResource = this.exerciceService.getAll(this.query);

	protected readonly rows = computed<readonly Exercice[]>(() => this.exercicesResource.value()?.content ?? []);
	protected readonly totalElements = computed(() => this.exercicesResource.value()?.totalElements ?? 0);
	protected readonly loading = computed(() => this.exercicesResource.isLoading());

	// --- Modale de formulaire ---
	protected readonly dialogOpen = signal(false);
	protected readonly dialogMode = signal<ExerciceFormMode>('create');
	protected readonly selectedRow = signal<Exercice | null>(null);

	// --- Confirmation de suppression ---
	protected readonly confirmOpen = signal(false);
	protected readonly rowToDelete = signal<Exercice | null>(null);

	// --- Message d'erreur de suppression (aria-live, affiché dans la page) ---
	protected readonly errorMessage = signal<string | null>(null);

	// --- Message d'erreur de sauvegarde (affiché dans la modale) ---
	protected readonly saveErrorMessage = signal<string | null>(null);

	// Templates de cellule déclarés dans le HTML de la page.
	private readonly exerciceTpl = viewChild<TemplateRef<{ $implicit: Exercice }>>('exerciceCell');
	private readonly typeTpl = viewChild<TemplateRef<{ $implicit: Exercice }>>('typeCell');
	private readonly categorieTpl = viewChild<TemplateRef<{ $implicit: Exercice }>>('categorieCell');
	private readonly estimateTpl = viewChild<TemplateRef<{ $implicit: Exercice }>>('estimateCell');
	private readonly actionsTpl = viewChild<TemplateRef<{ $implicit: Exercice }>>('actionsCell');

	/**
	 * Définition des colonnes, dérivée des templates de cellule. Retourne `[]` tant
	 * que les templates ne sont pas disponibles (premier rendu).
	 */
	protected readonly columns = computed<readonly ColumnDef<Exercice>[]>(() => {
		const exercice = this.exerciceTpl();
		const type = this.typeTpl();
		const categorie = this.categorieTpl();
		const estimate = this.estimateTpl();
		const actions = this.actionsTpl();
		if (!exercice || !type || !categorie || !estimate || !actions) {
			return [];
		}
		return [
			{key: 'exerciceCode', headerLabel: 'exercices.fields.exercice', cellClass: 'cursor-pointer', sortable: true, hideable: false, align: 'start', cellTemplate: exercice},
			{key: 'typeExercice', headerLabel: 'exercices.fields.type', sortable: true, align: 'start', hideable: false, cellTemplate: type},
			{key: 'categorieExercice', headerLabel: 'exercices.fields.categorie', sortable: true, align: 'start', hideable: false, cellTemplate: categorie},
			{key: 'estimateValue', headerLabel: 'exercices.fields.estimate', sortable: true, align: 'end', hideable: false, cellTemplate: estimate},
			{key: 'actions', headerLabel: 'exercices.fields.actions', hideable: false, align: 'end', width: '80px', cellTemplate: actions}
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
		this.saveErrorMessage.set(null);
		this.selectedRow.set(null);
		this.dialogMode.set('create');
		this.dialogOpen.set(true);
	}

	protected openEdit(row: Exercice): void {
		this.saveErrorMessage.set(null);
		this.selectedRow.set(row);
		this.dialogMode.set('edit');
		this.dialogOpen.set(true);
	}

	/** Ouvre la fiche en modification lors d'un clic sur la cellule « exercice ». */
	protected onCellClick(event: CellClickEvent<Exercice>): void {
		if (event.column.key === 'exerciceCode') {
			this.openEdit(event.row);
		}
	}

	protected closeDialog(): void {
		this.dialogOpen.set(false);
	}

	protected async onSave(request: ExerciceRequest): Promise<void> {
		this.saveErrorMessage.set(null);
		try {
			const current = this.selectedRow();
			if (current) {
				await this.exerciceService.update(current.exerciceId, request);
			} else {
				await this.exerciceService.create(request);
			}
			this.dialogOpen.set(false);
			this.exercicesResource.reload();
		} catch (error) {
			this.saveErrorMessage.set(this.isConflict(error) ? 'exercices.errors.duplicate' : 'exercices.errors.save');
		}
	}

	// --- Suppression ---
	protected askDelete(row: Exercice): void {
		this.rowToDelete.set(row);
		this.confirmOpen.set(true);
	}

	/** Route l'action choisie dans l'action-menu (souris ou clavier via wa-dropdown). */
	protected onRowAction(row: Exercice, event: Event): void {
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
			await this.exerciceService.delete(row.exerciceId);
			this.exercicesResource.reload();
		} catch {
			this.errorMessage.set('exercices.errors.delete');
		} finally {
			this.rowToDelete.set(null);
		}
	}

	/** Détecte un conflit d'unicité (HTTP 409) renvoyé par le backend. */
	private isConflict(error: unknown): boolean {
		return typeof error === 'object' && error !== null && (error as { status?: number }).status === 409;
	}
}
