import {
	ChangeDetectionStrategy,
	Component,
	computed,
	CUSTOM_ELEMENTS_SCHEMA,
	ElementRef,
	inject,
	signal,
	viewChild
} from '@angular/core';
import {TranslatePipe, TranslateService} from '@ngx-translate/core';
import {GridFilter} from '../../../models/data-grid.model';
import {PlanningService} from '../../../services/planning.service';
import {
	EXERCICE_ORDERS,
	EXERCICE_TYPES,
	ExerciceType,
	ExerciceTypeOrEmpty,
	PlanningCell,
	PlanningFilter,
	PlanningGrid,
	PlanningRow,
	RefPlanning,
	WEEKS_NUMBERS
} from '../../../models/planning.model';

// Composants WebAwesome utilisés (enregistrement ciblé).
import '@awesome.me/webawesome/dist/components/select/select.js';
import '@awesome.me/webawesome/dist/components/option/option.js';
import '@awesome.me/webawesome/dist/components/icon/icon.js';
import '@awesome.me/webawesome/dist/components/toast/toast.js';
import type WaToast from '@awesome.me/webawesome/dist/components/toast/toast.js';

@Component({
	selector: 'app-planning',
	standalone: true,
	imports: [TranslatePipe],
	schemas: [CUSTOM_ELEMENTS_SCHEMA],
	changeDetection: ChangeDetectionStrategy.OnPush,
	templateUrl: './planning.component.html',
	host: {class: 'flex flex-1 min-h-0'}
})
export class PlanningComponent {

	private readonly planningService = inject(PlanningService);
	private readonly translate = inject(TranslateService);

	/** Formats hebdomadaires proposés par le filtre (3 / 4 / 5). */
	protected readonly weeksNumbers = WEEKS_NUMBERS;

	/** Types d'exercice proposés dans chaque cellule (hors option vide). */
	protected readonly exerciceTypes = EXERCICE_TYPES;

	/** Format hebdomadaire sélectionné (toujours défini — défaut 3, RG1). */
	protected readonly selectedWeeksNumbers = signal<number>(3);

	/** Toast d'erreur transitoire (notification non bloquante). */
	private readonly errorToast = viewChild<ElementRef<WaToast>>('errorToast');

	// --- Lecture (size=0 : toutes les lignes du format en un seul appel) ---

	/** Requête figée : tout le format sélectionné, sans pagination ni tri. */
	protected readonly query = computed<PlanningFilter & GridFilter>(() => ({
		weeksNumbers: this.selectedWeeksNumbers(),
		trainingOrder: null,
		page: 0,
		size: 0,
		sort: null
	}));

	/** Ressource réactive : se recharge automatiquement quand le format change. */
	protected readonly planningResource = this.planningService.getAll(this.query);

	/** Index des lignes existantes par clé `${trainingOrder}:${exerciceOrder}`. */
	private readonly index = computed<Map<string, RefPlanning>>(() => {
		const content = this.planningResource.value()?.content ?? [];
		const map = new Map<string, RefPlanning>();
		for (const row of content) {
			map.set(this.key(row.trainingOrder, row.exerciceOrder), row);
		}
		return map;
	});

	/** Overrides optimistes : état transitoire des cellules éditées depuis le dernier chargement. */
	private readonly optimisticOverrides = signal<Map<string, PlanningCell>>(new Map());

	/**
	 * Grille pivot : 6 lignes fixes (n° exercice 1..6) × N colonnes (séances 1..format).
	 * Chaque cellule est résolue d'abord via l'override optimiste, sinon via l'index
	 * issu de la ressource, sinon par une cellule vide.
	 */
	protected readonly grid = computed<PlanningGrid>(() => {
		const weeksNumbers = this.selectedWeeksNumbers();
		const index = this.index();
		const overrides = this.optimisticOverrides();
		const trainingOrders = Array.from({length: weeksNumbers}, (_, i) => i + 1);

		const rows: PlanningRow[] = EXERCICE_ORDERS.map((exerciceOrder) => {
			const cells: PlanningCell[] = trainingOrders.map((trainingOrder) => {
				const k = this.key(trainingOrder, exerciceOrder);
				const override = overrides.get(k);
				if (override) {
					return override;
				}
				const existing = index.get(k);
				if (existing) {
					return {
						exerciceOrder,
						trainingOrder,
						refPlanningId: existing.refPlanningId,
						exerciceType: existing.exerciceType
					};
				}
				return {exerciceOrder, trainingOrder, refPlanningId: null, exerciceType: ''};
			});
			return {exerciceOrder, cells};
		});

		return {weeksNumbers, trainingOrders, rows};
	});

	/** Clé d'index/override d'une cellule. */
	private key(trainingOrder: number, exerciceOrder: number): string {
		return `${trainingOrder}:${exerciceOrder}`;
	}

	// --- Filtre format hebdomadaire ---

	/**
	 * Change le format hebdomadaire sélectionné. La valeur est normalisée en nombre ;
	 * une valeur invalide / vide est ignorée pour garantir qu'un format reste toujours
	 * sélectionné (RG1). Le changement recharge la ressource via `query`.
	 */
	protected onWeeksNumbersChange(value: number | string): void {
		const n = Number(value);
		if (!Number.isFinite(n) || !this.weeksNumbers.includes(n)) {
			return;
		}
		this.selectedWeeksNumbers.set(n);
		this.optimisticOverrides.set(new Map());
	}

	// --- Édition inline (persistance optimiste + rollback) ---

	/**
	 * Applique le changement de type d'une cellule : mise à jour optimiste immédiate,
	 * persistance (POST / PUT / DELETE selon l'état, RG6), puis réconciliation ou
	 * rollback + toast en cas d'échec.
	 */
	protected async onCellChange(cell: PlanningCell, newValue: string): Promise<void> {
		const prevType = cell.exerciceType;
		const prevId = cell.refPlanningId;
		const value = newValue as ExerciceTypeOrEmpty;
		const weeksNumbers = this.selectedWeeksNumbers();

		// Aucun changement effectif : rien à persister.
		if (value === prevType) {
			return;
		}

		// Mise à jour optimiste immédiate.
		this.setOverride({...cell, exerciceType: value});

		try {
			if (prevId == null && value !== '') {
				// Création.
				const created = await this.planningService.create({
					weeksNumbers,
					trainingOrder: cell.trainingOrder,
					exerciceOrder: cell.exerciceOrder,
					exerciceType: value as ExerciceType
				});
				this.setOverride({...cell, refPlanningId: created.refPlanningId, exerciceType: value});
			} else if (prevId != null && value !== '') {
				// Modification.
				await this.planningService.update(prevId, {
					weeksNumbers,
					trainingOrder: cell.trainingOrder,
					exerciceOrder: cell.exerciceOrder,
					exerciceType: value as ExerciceType
				});
				this.setOverride({...cell, refPlanningId: prevId, exerciceType: value});
			} else if (prevId != null && value === '') {
				// Suppression.
				await this.planningService.delete(prevId);
				this.setOverride({...cell, refPlanningId: null, exerciceType: ''});
			}
		} catch {
			// Rollback de la cellule à son état antérieur + notification.
			this.setOverride({...cell, refPlanningId: prevId, exerciceType: prevType});
			this.showError(value === '' ? 'planning.errors.delete' : 'planning.errors.save');
		}
	}

	/** Écrit/met à jour une entrée d'override de façon immuable (recrée la Map). */
	private setOverride(cell: PlanningCell): void {
		const next = new Map(this.optimisticOverrides());
		next.set(this.key(cell.trainingOrder, cell.exerciceOrder), cell);
		this.optimisticOverrides.set(next);
	}

	/** Affiche un toast d'erreur (message déjà traduit, texte brut — pas d'allowHtml). */
	private showError(key: string): void {
		this.errorToast()?.nativeElement.create(this.translate.instant(key), {
			variant: 'danger',
			icon: 'triangle-exclamation'
		});
	}
}
