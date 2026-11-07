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
import {DataGridComponent} from '../../../components/data-grid/data-grid.component';
import {CellClickEvent, ColumnDef, GridFilter, SortState} from '../../../models/data-grid.model';
import {ConfirmDialogComponent} from '../../../components/confirm-dialog/confirm-dialog.component';
import {WaSelectControlDirective} from '../../../directives/wa-forms/wa-select-control.directive';
import {ProtocoleFormDialogComponent, ProtocoleSaveEvent} from './protocole-form-dialog/protocole-form-dialog.component';
import {ProtocoleService} from '../../../services/protocole.service';
import {
	Archetype,
	goalsForMovement,
	Movement,
	MOVEMENTS,
	PROTOCOLE_ARCHETYPES,
	ProtocoleFilter,
	ProtocoleGoal,
	ProtocoleRow,
	RefExercice,
	WEEK_TYPES,
	WeekTypeRef
} from '../../../models/protocole.model';

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

/** Mode d'ouverture de la modale de protocole (raccordée au Lot 6). */
export type ProtocoleFormMode = 'create' | 'edit';

/**
 * Écran « Protocoles » du référentiel : liste paginée/filtrée/triée (côté serveur)
 * des exercices de référence et de leurs séries, éclatée en une ligne par
 * (exercice × archétype). Calqué sur l'écran Archétype.
 */
@Component({
	selector: 'app-protocoles',
	standalone: true,
	imports: [TranslatePipe, FormField, WaSelectControlDirective, DataGridComponent, ConfirmDialogComponent, ProtocoleFormDialogComponent],
	schemas: [CUSTOM_ELEMENTS_SCHEMA],
	changeDetection: ChangeDetectionStrategy.OnPush,
	templateUrl: './protocoles.component.html',
	host: {class: 'flex flex-1 min-h-0'}
})
export class ProtocolesComponent {

	private readonly protocoleService = inject(ProtocoleService);
	private readonly translate = inject(TranslateService);

	protected readonly movements = MOVEMENTS;
	protected readonly weekTypes = WEEK_TYPES;
	protected readonly archetypes = PROTOCOLE_ARCHETYPES;

	/** Identité d'une ligne éclatée : exercice + archétype (unique). */
	protected readonly rowId = (row: ProtocoleRow): string => `${row.exercice.refExerciceId}-${row.archetype}`;

	/** Traduction impérative (pour aria-label et messages du toast). */
	protected t(key: string): string {
		return this.translate.instant(key);
	}

	// --- Critères de recherche (pilotent la ressource HTTP) ---

	/** Filtre métier (chaînes vides = pas de filtre). */
	private readonly filtersModel = signal<{
		exerciceType: Movement | '';
		weekType: WeekTypeRef | '';
		goal: ProtocoleGoal | '';
		archetype: Archetype | '';
	}>({exerciceType: '', weekType: '', goal: '', archetype: ''});

	/** Formulaire de filtres (Signal Forms) — sans validation, source des critères. */
	protected readonly filtersForm = form(this.filtersModel);

	/**
	 * Objectifs proposés dans le filtre, dépendants du mouvement sélectionné (RG12).
	 * Sans mouvement, aucun objectif n'est proposé (le domaine Objectif n'a de sens
	 * que relativement à un mouvement).
	 */
	protected readonly goalOptions = computed<readonly ProtocoleGoal[]>(() => {
		const movement = this.filtersModel().exerciceType;
		return movement ? goalsForMovement(movement) : [];
	});

	protected readonly page = signal(0);
	protected readonly pageSize = signal(10);
	protected readonly sort = signal<SortState | null>({key: 'exerciceType', direction: 'asc'});

	/** Filtre métier normalisé (chaînes vides → null). */
	private readonly protocoleFilter = computed<ProtocoleFilter>(() => {
		const {exerciceType, weekType, goal, archetype} = this.filtersModel();
		return {
			exerciceType: exerciceType || null,
			weekType: weekType || null,
			goal: goal || null,
			archetype: archetype || null
		};
	});

	/**
	 * Filtre de grille envoyé au serveur. La pagination est faite CÔTÉ CLIENT (voir
	 * `rows`) : on récupère donc TOUS les exercices (`size = 0`, pattern éprouvé —
	 * learning.md 2026-09-06) et on applique le tri serveur. Raison : la grille
	 * affiche une ligne par (exercice × archétype) ; une pagination serveur sur les
	 * exercices rendrait un nombre de lignes variable et supérieur à la taille de
	 * page choisie. Paginer sur les lignes éclatées garantit que 10/25/50 limite
	 * exactement les lignes visibles.
	 */
	private readonly gridFilter = computed<GridFilter>(() => ({
		page: 0,
		size: 0,
		sort: this.sort() ? `${this.sort()!.key},${this.sort()!.direction}` : null
	}));

	/** Requête complète : combinaison du filtre métier et du filtre de grille. */
	protected readonly query = computed<ProtocoleFilter & GridFilter>(() => ({
		...this.protocoleFilter(),
		...this.gridFilter()
	}));

	/** Ressource réactive : se recharge automatiquement quand `query` change. */
	protected readonly protocolesResource = this.protocoleService.getAll(this.query);

	private readonly exercices = computed<readonly RefExercice[]>(() => this.protocolesResource.value()?.content ?? []);
	protected readonly loading = computed(() => this.protocolesResource.isLoading());

	/**
	 * Toutes les lignes du tableau (non paginées) : chaque exercice est éclaté en une
	 * ligne par archétype présent dans ses séries (RG5). Si un archétype est filtré,
	 * seules les lignes de cet archétype sont conservées.
	 */
	private readonly allRows = computed<readonly ProtocoleRow[]>(() => {
		const archetypeFilter = this.protocoleFilter().archetype;
		const result: ProtocoleRow[] = [];
		for (const exercice of this.exercices()) {
			// Regroupement des séries par archétype, dans l'ordre d'apparition.
			const byArchetype = new Map<Archetype, RefExercice['sets']>();
			for (const set of exercice.sets) {
				const existing = byArchetype.get(set.archetype);
				if (existing) {
					existing.push(set);
				} else {
					byArchetype.set(set.archetype, [set]);
				}
			}
			for (const [archetype, sets] of byArchetype) {
				if (archetypeFilter && archetype !== archetypeFilter) {
					continue;
				}
				result.push({exercice, archetype, sets});
			}
		}
		return result;
	});

	/** Nombre total de lignes éclatées (pilote la pagination côté grille). */
	protected readonly totalElements = computed(() => this.allRows().length);

	/** Lignes de la page courante (pagination client sur les lignes éclatées). */
	protected readonly rows = computed<readonly ProtocoleRow[]>(() => {
		const all = this.allRows();
		const size = this.pageSize();
		const start = this.page() * size;
		return all.slice(start, start + size);
	});

	// --- Modale de formulaire (raccordée au Lot 6) ---
	protected readonly dialogOpen = signal(false);
	protected readonly dialogMode = signal<ProtocoleFormMode>('create');
	protected readonly selectedRow = signal<ProtocoleRow | null>(null);

	// --- Confirmation de suppression ---
	protected readonly confirmOpen = signal(false);
	protected readonly rowToDelete = signal<ProtocoleRow | null>(null);

	// --- Toast d'erreur transitoire (learning.md 2026-10-17) ---
	private readonly errorToast = viewChild<ElementRef<WaToast>>('errorToast');

	// Templates de cellule déclarés dans le HTML de la page.
	private readonly movementTpl = viewChild<TemplateRef<{ $implicit: ProtocoleRow }>>('movementCell');
	private readonly weekTypeTpl = viewChild<TemplateRef<{ $implicit: ProtocoleRow }>>('weekTypeCell');
	private readonly goalTpl = viewChild<TemplateRef<{ $implicit: ProtocoleRow }>>('goalCell');
	private readonly trainingOrderTpl = viewChild<TemplateRef<{ $implicit: ProtocoleRow }>>('trainingOrderCell');
	private readonly exerciceTpl = viewChild<TemplateRef<{ $implicit: ProtocoleRow }>>('exerciceCell');
	private readonly archetypeTpl = viewChild<TemplateRef<{ $implicit: ProtocoleRow }>>('archetypeCell');
	private readonly setsTpl = viewChild<TemplateRef<{ $implicit: ProtocoleRow }>>('setsCell');
	private readonly actionsTpl = viewChild<TemplateRef<{ $implicit: ProtocoleRow }>>('actionsCell');

	/**
	 * Définition des colonnes, dérivée des templates de cellule. Retourne `[]` tant
	 * que les templates ne sont pas disponibles (premier rendu). La colonne
	 * « référence » n'est volontairement PAS affichée (RG4).
	 */
	protected readonly columns = computed<readonly ColumnDef<ProtocoleRow>[]>(() => {
		const movement = this.movementTpl();
		const weekType = this.weekTypeTpl();
		const goal = this.goalTpl();
		const trainingOrder = this.trainingOrderTpl();
		const exercice = this.exerciceTpl();
		const archetype = this.archetypeTpl();
		const sets = this.setsTpl();
		const actions = this.actionsTpl();
		if (!movement || !weekType || !goal || !trainingOrder || !exercice || !archetype || !sets || !actions) {
			return [];
		}
		return [
			{key: 'exerciceType', headerLabel: 'protocoles.columns.movement', cellClass: 'cursor-pointer', sortable: true, hideable: false, align: 'start', cellTemplate: movement},
			{key: 'weekType', headerLabel: 'protocoles.columns.weekType', sortable: true, align: 'start', hideable: false, cellTemplate: weekType},
			{key: 'goal', headerLabel: 'protocoles.columns.goal', sortable: true, align: 'start', hideable: false, cellTemplate: goal},
			{key: 'trainingOrder', headerLabel: 'protocoles.columns.trainingOrder', sortable: true, align: 'center', width: '110px', cellTemplate: trainingOrder},
			{key: 'exerciceName', headerLabel: 'protocoles.columns.exercice', sortable: true, align: 'start', hideable: false, cellTemplate: exercice},
			{key: 'archetype', headerLabel: 'protocoles.columns.archetype', align: 'start', hideable: false, cellTemplate: archetype},
			{key: 'sets', headerLabel: 'protocoles.columns.sets', align: 'start', hideable: false, cellTemplate: sets},
			{key: 'actions', headerLabel: 'protocoles.columns.actions', hideable: false, align: 'end', width: '80px', cellTemplate: actions}
		];
	});

	constructor() {
		// Revenir à la première page dès que les filtres changent.
		effect(() => {
			this.filtersModel();
			this.page.set(0);
		});

		// Réinitialiser l'objectif s'il n'est plus applicable au mouvement courant (RG12).
		effect(() => {
			const options = this.goalOptions();
			const current = this.filtersForm.goal().value();
			if (current && !options.includes(current as ProtocoleGoal)) {
				this.filtersForm.goal().value.set('');
			}
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

	protected openEdit(row: ProtocoleRow): void {
		this.selectedRow.set(row);
		this.dialogMode.set('edit');
		this.dialogOpen.set(true);
	}

	/** Ouvre la fiche en modification lors d'un clic sur la cellule « mouvement ». */
	protected onCellClick(event: CellClickEvent<ProtocoleRow>): void {
		if (event.column.key === 'exerciceType') {
			this.openEdit(event.row);
		}
	}

	protected closeDialog(): void {
		this.dialogOpen.set(false);
	}

	/** Rechargement de la liste après une sauvegarde réussie (émise par la modale, Lot 6). */
	protected onSaved(): void {
		this.dialogOpen.set(false);
		this.protocolesResource.reload();
	}

	/**
	 * Persiste la sauvegarde émise par la modale : création (POST) ou modification
	 * (PUT ciblée sur l'archétype de la ligne). Succès → fermeture + rechargement ;
	 * échec → toast d'erreur transitoire, modale conservée (US5/US6).
	 */
	protected async onSave(event: ProtocoleSaveEvent): Promise<void> {
		try {
			if (this.dialogMode() === 'edit' && event.refExerciceId != null) {
				await this.protocoleService.update(event.refExerciceId, event.request);
			} else {
				await this.protocoleService.create(event.request);
			}
			this.onSaved();
		} catch {
			this.showError('protocoles.errors.save');
		}
	}

	// --- Suppression ---
	protected askDelete(row: ProtocoleRow): void {
		this.rowToDelete.set(row);
		this.confirmOpen.set(true);
	}

	/** Route l'action choisie dans l'action-menu (souris ou clavier via wa-dropdown). */
	protected onRowAction(row: ProtocoleRow, event: Event): void {
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
		try {
			// Suppression ciblée des séries de l'archétype de la ligne : si l'exercice
			// n'a plus aucune série, le backend supprime l'exercice (US7).
			await this.protocoleService.deleteArchetypeSets(row.exercice.refExerciceId, row.archetype);
			this.protocolesResource.reload();
		} catch {
			this.showError('protocoles.errors.delete');
		} finally {
			this.rowToDelete.set(null);
		}
	}

	/** Affiche une notification d'erreur transitoire (wa-toast, variant danger). */
	private showError(key: string): void {
		this.errorToast()?.nativeElement.create(this.t(key), {variant: 'danger', icon: 'triangle-exclamation'});
	}
}
