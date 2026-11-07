import {
	ChangeDetectionStrategy,
	Component,
	computed,
	CUSTOM_ELEMENTS_SCHEMA,
	effect,
	inject,
	input,
	output,
	signal,
	untracked
} from '@angular/core';
import {TranslatePipe, TranslateService} from '@ngx-translate/core';
import {applyEach, disabled, form, FormField, min, required, validate} from '@angular/forms/signals';
import {WaInputControlDirective} from '../../../../directives/wa-forms/wa-input-control.directive';
import {WaNumberInputControlDirective} from '../../../../directives/wa-forms/wa-number-input-control.directive';
import {WaSelectControlDirective} from '../../../../directives/wa-forms/wa-select-control.directive';
import {WaFieldErrorDirective} from '../../../../directives/wa-forms/wa-field-error.directive';
import {
	Archetype,
	goalsForMovement,
	Movement,
	MOVEMENTS,
	PROTOCOLE_ARCHETYPES,
	ProtocoleGoal,
	ProtocoleRow,
	Reference,
	referenceForMovement,
	REFERENCE_OPTIONS,
	RefExerciceRequest,
	RefExerciceSet,
	RefExerciceSetRequest,
	WeekTypeRef,
	WEEK_TYPES
} from '../../../../models/protocole.model';

// Composants WebAwesome utilisés (enregistrement ciblé).
import '@awesome.me/webawesome/dist/components/dialog/dialog.js';
import '@awesome.me/webawesome/dist/components/input/input.js';
import '@awesome.me/webawesome/dist/components/select/select.js';
import '@awesome.me/webawesome/dist/components/option/option.js';
import '@awesome.me/webawesome/dist/components/button/button.js';
import '@awesome.me/webawesome/dist/components/icon/icon.js';

/** Mode d'affichage de la modale (aligné sur ProtocoleFormMode de la liste). */
export type ProtocoleFormMode = 'create' | 'edit';

/**
 * Charge utile émise à la sauvegarde : le payload de l'exercice et l'archétype
 * concerné (nécessaire en édition pour que le backend ne remplace que les séries
 * de cet archétype, les autres restant intactes).
 */
export interface ProtocoleSaveEvent {
	readonly refExerciceId: number | null;
	readonly archetype: Archetype;
	readonly request: RefExerciceRequest;
}

/** Ligne de série saisie dans le bloc dynamique du formulaire. */
interface SeriesFormRow {
	setNumber: number | null;
	repNumber: string;
	weight: number | null;
}

/**
 * Modèle interne du formulaire. Les valeurs de listes déroulantes sont des chaînes
 * pour s'interfacer directement avec les value accessors WebAwesome ; `trainingOrder`
 * et les champs de séries numériques sont typés `number | null`.
 */
interface ProtocoleFormModel {
	exerciceType: string;
	weekType: string;
	goal: string;
	archetype: string;
	trainingOrder: number | null;
	exerciceName: string;
	reference: string;
	sets: SeriesFormRow[];
}

/**
 * Modale de gestion d'un protocole (exercice de référence + ses séries pour un
 * archétype), pilotée par un {@link ProtocoleFormMode} : création ou modification.
 *
 * - **Création** : tous les champs actifs. L'exercice de référence est proposé en
 *   liste déroulante (domaine `{SN, CJ, FS, BS}`), pré-sélectionné selon le
 *   mouvement (RG4) mais librement modifiable. Les séries saisies sont attribuées
 *   à l'archétype choisi.
 * - **Édition** : seuls le libellé de l'exercice et les séries de l'archétype de
 *   la ligne sont modifiables ; mouvement, semaine, objectif, archétype, numéro de
 *   séance et exercice de référence sont verrouillés.
 *
 * Les répétitions sont un **champ texte** (RG11 : formats libres `6`, `30s`,
 * `1 + 1`, …). La charge est un pourcentage de l'exercice de référence, non requis
 * pour la Musculation.
 */
@Component({
	selector: 'app-protocole-form-dialog',
	standalone: true,
	imports: [
		TranslatePipe,
		FormField,
		WaInputControlDirective,
		WaNumberInputControlDirective,
		WaSelectControlDirective,
		WaFieldErrorDirective
	],
	schemas: [CUSTOM_ELEMENTS_SCHEMA],
	changeDetection: ChangeDetectionStrategy.OnPush,
	templateUrl: './protocole-form-dialog.component.html'
})
export class ProtocoleFormDialogComponent {

	private readonly translate = inject(TranslateService);

	readonly open = input<boolean>(false);
	readonly mode = input<ProtocoleFormMode>('create');
	readonly protocoleRow = input<ProtocoleRow | null>(null);

	readonly save = output<ProtocoleSaveEvent>();
	readonly close = output<void>();

	protected readonly movements = MOVEMENTS;
	protected readonly weekTypes = WEEK_TYPES;
	protected readonly archetypes = PROTOCOLE_ARCHETYPES;

	/** Source de vérité du formulaire. */
	protected readonly model = signal<ProtocoleFormModel>(this.emptyModel());

	/**
	 * Dernier mouvement pour lequel la déduction (objectif + référence par défaut) a
	 * été appliquée. Sert à ne déclencher la déduction que sur un vrai changement de
	 * mouvement, sans écraser les choix manuels ni boucler avec le signal `model`.
	 */
	private lastMovement: Movement | '' = '';

	/**
	 * Formulaire Signal Forms.
	 * - Champs requis communs : mouvement, semaine, objectif, archétype, n° séance, libellé.
	 * - En édition : tout est verrouillé sauf le libellé et les séries (US5).
	 * - Par série : `setNumber` requis (> 0) ; `weight` requis hors Musculation (RG8).
	 */
	protected readonly protocoleForm = form(this.model, (path) => {
		const isEdit = () => this.mode() === 'edit';

		required(path.exerciceType, {message: 'protocoles.form.errors.movement'});
		required(path.weekType, {message: 'protocoles.form.errors.weekType'});
		required(path.goal, {message: 'protocoles.form.errors.goal'});
		required(path.archetype, {message: 'protocoles.form.errors.archetype'});
		required(path.trainingOrder, {message: 'protocoles.form.errors.trainingOrder'});
		min(path.trainingOrder, 1, {message: 'protocoles.form.errors.trainingOrder'});
		required(path.exerciceName, {message: 'protocoles.form.errors.exerciceName'});

		// Métadonnées verrouillées en édition (seuls libellé + séries modifiables).
		disabled(path.exerciceType, {when: isEdit});
		disabled(path.weekType, {when: isEdit});
		disabled(path.goal, {when: isEdit});
		disabled(path.archetype, {when: isEdit});
		disabled(path.trainingOrder, {when: isEdit});
		disabled(path.reference, {when: isEdit});

		applyEach(path.sets, (rowPath) => {
			required(rowPath.setNumber, {message: 'protocoles.form.errors.setNumber'});
			min(rowPath.setNumber, 1, {message: 'protocoles.form.errors.setNumber'});
			// Charge requise sauf Musculation (RG8).
			validate(rowPath.weight, (ctx) => {
				if (this.isMusculation()) {
					return undefined;
				}
				return ctx.value() == null
					? {kind: 'required', message: 'protocoles.form.errors.weight'}
					: undefined;
			});
		});
	});

	protected readonly title = computed(() =>
		this.mode() === 'create' ? 'protocoles.form.title.create' : 'protocoles.form.title.edit'
	);

	/** Objectifs proposés selon le mouvement courant (RG12). */
	protected readonly goalOptions = computed<readonly ProtocoleGoal[]>(() => {
		const movement = this.model().exerciceType as Movement | '';
		return movement ? goalsForMovement(movement) : [];
	});

	/** `true` si le mouvement courant est la Musculation (pas de référence ni de charge). */
	protected readonly isMusculation = computed<boolean>(() => this.model().exerciceType === 'MS');

	/**
	 * Exercices de référence de charge proposés dans la liste déroulante (domaine
	 * `{SN, CJ, FS, BS}`). Toujours la même liste : la sélection est libre, seule la
	 * valeur par défaut est déduite du mouvement (RG4). Masquée pour la Musculation.
	 */
	protected readonly referenceOptions = REFERENCE_OPTIONS;

	constructor() {
		// Réinitialise le formulaire à chaque (ré)ouverture ou changement de ligne.
		effect(() => {
			this.open();
			const source = this.protocoleRow();
			this.model.set(source ? this.toModel(source) : this.emptyModel());
			// Mémorise le mouvement courant pour que l'effet de déduction ne réécrase
			// pas une valeur fraîchement chargée (édition / ré-ouverture).
			this.lastMovement = untracked(() => this.model().exerciceType) as Movement | '';
		});

		// Création : quand le MOUVEMENT change, réinitialise l'objectif s'il n'est plus
		// applicable (RG12) et pré-sélectionne l'exercice de référence déduit (RG4).
		// En édition, le mouvement est verrouillé.
		//
		// L'écriture dans `model` (que cet effect lit aussi) est encadrée pour éviter
		// une boucle : on n'applique la déduction QUE sur un vrai changement de
		// mouvement (comparaison à `lastMovement`) — un choix manuel d'objectif ou de
		// référence (même mouvement) n'est donc jamais écrasé — et l'écriture passe par
		// `untracked` pour ne pas redéclencher l'effet sur elle-même.
		effect(() => {
			if (this.mode() === 'edit') {
				return;
			}
			const movement = this.model().exerciceType as Movement | '';
			if (movement === this.lastMovement) {
				return;
			}
			this.lastMovement = movement;
			if (!movement) {
				return;
			}
			const goals = goalsForMovement(movement);
			untracked(() => {
				this.model.update((m) => ({
					...m,
					// Objectif conservé s'il reste valide pour le nouveau mouvement, sinon vidé.
					goal: goals.includes(m.goal as ProtocoleGoal) ? m.goal : '',
					// Référence : valeur par défaut déduite du mouvement (reste modifiable).
					reference: this.referenceToString(referenceForMovement(movement))
				}));
			});
		});
	}

	/** Traduit une clé i18n de manière impérative (pour aria-label). */
	protected t(key: string): string {
		return this.translate.instant(key);
	}

	/** Ajoute une ligne de série vide à la fin du bloc. */
	protected addSeries(): void {
		this.model.update((m) => ({...m, sets: [...m.sets, this.emptySeries()]}));
	}

	/** Supprime la ligne de série à l'index donné (au moins une ligne subsiste). */
	protected removeSeries(index: number): void {
		this.model.update((m) =>
			m.sets.length <= 1 ? m : {...m, sets: m.sets.filter((_, i) => i !== index)}
		);
	}

	protected onSubmit(): void {
		if (this.protocoleForm().invalid()) {
			this.protocoleForm().markAsTouched();
			return;
		}
		const m = this.model();
		const archetype = m.archetype as Archetype;
		const request: RefExerciceRequest = {
			exerciceType: m.exerciceType as Movement,
			weekType: m.weekType as WeekTypeRef,
			goal: m.goal as ProtocoleGoal,
			trainingOrder: Number(m.trainingOrder),
			exerciceName: m.exerciceName.trim(),
			reference: this.isMusculation() ? null : (m.reference as Reference),
			sets: m.sets.map<RefExerciceSetRequest>((s) => ({
				archetype,
				setNumber: Number(s.setNumber),
				repNumber: s.repNumber.trim() ? s.repNumber.trim() : null,
				weight: this.isMusculation() ? null : s.weight
			}))
		};
		this.save.emit({
			refExerciceId: this.protocoleRow()?.exercice.refExerciceId ?? null,
			archetype,
			request
		});
	}

	protected onClose(): void {
		this.close.emit();
	}

	/**
	 * Ferme la modale uniquement si l'événement provient bien du dialog lui-même.
	 * Les composants `<wa-select>`/`<wa-input>` internes émettent aussi
	 * `wa-after-hide` (bubbling) lors de leur propre fermeture : on les ignore.
	 */
	protected onDialogHide(event: Event): void {
		if (event.target === event.currentTarget) {
			this.onClose();
		}
	}

	private referenceToString(reference: Reference): string {
		return reference ?? '';
	}

	private emptySeries(): SeriesFormRow {
		return {setNumber: null, repNumber: '', weight: null};
	}

	private emptyModel(): ProtocoleFormModel {
		return {
			exerciceType: '',
			weekType: '',
			goal: '',
			archetype: '',
			trainingOrder: null,
			exerciceName: '',
			reference: '',
			sets: [this.emptySeries()]
		};
	}

	private toModel(row: ProtocoleRow): ProtocoleFormModel {
		const {exercice} = row;
		const sets = row.sets.length > 0 ? row.sets.map((s) => this.seriesToForm(s)) : [this.emptySeries()];
		return {
			exerciceType: exercice.exerciceType,
			weekType: exercice.weekType,
			goal: exercice.goal,
			archetype: row.archetype,
			trainingOrder: exercice.trainingOrder,
			exerciceName: exercice.exerciceName,
			reference: this.referenceToString(exercice.reference),
			sets
		};
	}

	private seriesToForm(set: RefExerciceSet): SeriesFormRow {
		return {
			setNumber: set.setNumber,
			repNumber: set.repNumber ?? '',
			weight: set.weight
		};
	}
}
