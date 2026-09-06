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
import {ArchetypeFormDialogComponent, ArchetypeFormMode} from './archetype-form-dialog/archetype-form-dialog.component';
import {ConfirmDialogComponent} from '../../../components/confirm-dialog/confirm-dialog.component';
import {WaSelectControlDirective} from '../../../directives/wa-forms/wa-select-control.directive';
import {ArchetypeService} from '../../../services/archetype.service';
import {
	ARCHETYPES,
	Archetype,
	ArchetypeFilter,
	ENDURANCES,
	Endurance,
	RefArchetype,
	RefArchetypeRequest,
	STRENGTH_SPEEDS,
	StrengthSpeed,
	TECHNIQUES,
	Technique
} from '../../../models/archetype.model';

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
	selector: 'app-archetypes',
	standalone: true,
	imports: [TranslatePipe, FormField, WaSelectControlDirective, DataGridComponent, ArchetypeFormDialogComponent, ConfirmDialogComponent],
	schemas: [CUSTOM_ELEMENTS_SCHEMA],
	changeDetection: ChangeDetectionStrategy.OnPush,
	templateUrl: './archetypes.component.html',
	host: {class: 'flex flex-1 min-h-0'}
})
export class ArchetypesComponent {

	private readonly archetypeService = inject(ArchetypeService);
	private readonly translate = inject(TranslateService);

	protected readonly archetypes = ARCHETYPES;
	protected readonly strengthSpeeds = STRENGTH_SPEEDS;
	protected readonly techniques = TECHNIQUES;
	protected readonly endurances = ENDURANCES;

	/** Identité d'une ligne du grid : l'identifiant de l'archétype. */
	protected readonly rowId = (row: RefArchetype): number => row.refArchetypeId;

	/** Traduction impérative (pour aria-label). */
	protected t(key: string): string {
		return this.translate.instant(key);
	}

	// --- Critères de recherche (pilotent la ressource HTTP) ---

	/** Filtre métier (chaînes vides = pas de filtre). */
	private readonly filtersModel = signal<{
		archetype: Archetype | '';
		strengthSpeed: StrengthSpeed | '';
		technique: Technique | '';
		endurance: Endurance | '';
	}>({archetype: '', strengthSpeed: '', technique: '', endurance: ''});

	/** Formulaire de filtres (Signal Forms) — sans validation, source des critères. */
	protected readonly filtersForm = form(this.filtersModel);

	protected readonly page = signal(0);
	protected readonly pageSize = signal(10);
	protected readonly sort = signal<SortState | null>({key: 'archetype', direction: 'asc'});

	/** Filtre métier normalisé (chaînes vides → null). */
	private readonly archetypeFilter = computed<ArchetypeFilter>(() => {
		const {archetype, strengthSpeed, technique, endurance} = this.filtersModel();
		return {
			archetype: archetype || null,
			strengthSpeed: strengthSpeed || null,
			technique: technique || null,
			endurance: endurance || null
		};
	});

	/** Filtre de grille (pagination + tri). */
	private readonly gridFilter = computed<GridFilter>(() => ({
		page: this.page(),
		size: this.pageSize(),
		sort: this.sort() ? `${this.sort()!.key},${this.sort()!.direction}` : null
	}));

	/** Requête complète : combinaison du filtre métier et du filtre de grille. */
	protected readonly query = computed<ArchetypeFilter & GridFilter>(() => ({
		...this.archetypeFilter(),
		...this.gridFilter()
	}));

	/** Ressource réactive : se recharge automatiquement quand `query` change. */
	protected readonly archetypesResource = this.archetypeService.getAll(this.query);

	protected readonly rows = computed<readonly RefArchetype[]>(() => this.archetypesResource.value()?.content ?? []);
	protected readonly totalElements = computed(() => this.archetypesResource.value()?.totalElements ?? 0);
	protected readonly loading = computed(() => this.archetypesResource.isLoading());

	// --- Modale de formulaire ---
	protected readonly dialogOpen = signal(false);
	protected readonly dialogMode = signal<ArchetypeFormMode>('create');
	protected readonly selectedRow = signal<RefArchetype | null>(null);

	// --- Confirmation de suppression ---
	protected readonly confirmOpen = signal(false);
	protected readonly rowToDelete = signal<RefArchetype | null>(null);

	// --- Message d'erreur (aria-live) ---
	protected readonly errorMessage = signal<string | null>(null);

	// Templates de cellule déclarés dans le HTML de la page.
	private readonly strengthSpeedTpl = viewChild<TemplateRef<{ $implicit: RefArchetype }>>('strengthSpeedCell');
	private readonly techniqueTpl = viewChild<TemplateRef<{ $implicit: RefArchetype }>>('techniqueCell');
	private readonly enduranceTpl = viewChild<TemplateRef<{ $implicit: RefArchetype }>>('enduranceCell');
	private readonly archetypeTpl = viewChild<TemplateRef<{ $implicit: RefArchetype }>>('archetypeCell');
	private readonly actionsTpl = viewChild<TemplateRef<{ $implicit: RefArchetype }>>('actionsCell');

	/**
	 * Définition des colonnes, dérivée des templates de cellule. Retourne `[]` tant
	 * que les templates ne sont pas disponibles (premier rendu).
	 */
	protected readonly columns = computed<readonly ColumnDef<RefArchetype>[]>(() => {
		const strengthSpeed = this.strengthSpeedTpl();
		const technique = this.techniqueTpl();
		const endurance = this.enduranceTpl();
		const archetype = this.archetypeTpl();
		const actions = this.actionsTpl();
		if (!strengthSpeed || !technique || !endurance || !archetype || !actions) {
			return [];
		}
		return [
			{key: 'archetype', headerLabel: 'archetypes.fields.archetype', cellClass: 'cursor-pointer', sortable: true, hideable: false, align: 'start', cellTemplate: archetype},
			{key: 'strengthSpeed', headerLabel: 'archetypes.fields.strengthSpeed', sortable: true, align: 'start', hideable: false, cellTemplate: strengthSpeed},
			{key: 'technique', headerLabel: 'archetypes.fields.technique', sortable: true, align: 'start', hideable: false, cellTemplate: technique},
			{key: 'endurance', headerLabel: 'archetypes.fields.endurance', sortable: true, align: 'start', hideable: false, cellTemplate: endurance},
			{key: 'actions', headerLabel: 'archetypes.fields.actions', hideable: false, align: 'end', width: '80px', cellTemplate: actions}
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

	protected openEdit(row: RefArchetype): void {
		this.selectedRow.set(row);
		this.dialogMode.set('edit');
		this.dialogOpen.set(true);
	}

	/** Ouvre la fiche en modification lors d'un clic sur la cellule « archétype ». */
	protected onCellClick(event: CellClickEvent<RefArchetype>): void {
		if (event.column.key === 'archetype') {
			this.openEdit(event.row);
		}
	}

	protected closeDialog(): void {
		this.dialogOpen.set(false);
	}

	protected async onSave(request: RefArchetypeRequest): Promise<void> {
		this.errorMessage.set(null);
		try {
			const current = this.selectedRow();
			if (current) {
				await this.archetypeService.update(current.refArchetypeId, request);
			} else {
				await this.archetypeService.create(request);
			}
			this.dialogOpen.set(false);
			this.archetypesResource.reload();
		} catch (error) {
			this.errorMessage.set(this.isConflict(error) ? 'archetypes.errors.duplicate' : 'archetypes.errors.save');
		}
	}

	// --- Suppression ---
	protected askDelete(row: RefArchetype): void {
		this.rowToDelete.set(row);
		this.confirmOpen.set(true);
	}

	/** Route l'action choisie dans l'action-menu (souris ou clavier via wa-dropdown). */
	protected onRowAction(row: RefArchetype, event: Event): void {
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
			await this.archetypeService.delete(row.refArchetypeId);
			this.archetypesResource.reload();
		} catch {
			this.errorMessage.set('archetypes.errors.delete');
		} finally {
			this.rowToDelete.set(null);
		}
	}

	/** Détecte un conflit d'unicité (HTTP 409) renvoyé par le backend. */
	private isConflict(error: unknown): boolean {
		return typeof error === 'object' && error !== null && (error as { status?: number }).status === 409;
	}
}
