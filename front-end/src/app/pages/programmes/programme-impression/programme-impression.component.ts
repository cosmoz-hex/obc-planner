import {ChangeDetectionStrategy, Component, computed, inject, signal} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Title} from '@angular/platform-browser';
import {TranslatePipe, TranslateService} from '@ngx-translate/core';
import {LocalizedDatePipe} from '../../../pipes/localized-date.pipe';
import {ProgrammeDetail, ProgrammeWeek} from '../../../models/programme.model';
import {ProgrammeService} from '../../../services/programme.service';
import {gridRowsOf, ProgrammeGridRow, trainingNumbersOf} from '../programme-grid.util';

/** Vue d'impression d'une semaine : en-têtes de séances + lignes/cellules pivot. */
interface ImpressionWeek {
	readonly week: ProgrammeWeek;
	readonly trainingNumbers: readonly number[];
	readonly rows: readonly ProgrammeGridRow[];
}

/**
 * Page **nue** (hors layout) de restitution imprimable d'un programme.
 *
 * Elle charge le détail du programme ({@link ProgrammeService.getDetail}) à partir de
 * l'`id` de route et affiche **toutes** les semaines (pas de sélecteur), triées par
 * `weekNumber` croissant, avec pour chaque semaine son en-tête puis une grille pivot
 * (séances × positions), strictement calquée sur la consultation.
 *
 * C'est une simple vue de consultation : **aucune** commande d'impression dans l'app
 * (pas de bouton, pas de `window.print()`). L'utilisateur imprime via son navigateur
 * (Ctrl+P), la rupture de page par semaine étant gérée en CSS `@media print`.
 *
 * {@link LocalizedDatePipe} est utilisé en **template** (`| localizedDate`) ; il figure
 * donc dans `imports` (et non `providers`), cf. learning.md 2026-11-08.
 */
@Component({
	selector: 'app-programme-impression',
	standalone: true,
	imports: [TranslatePipe, LocalizedDatePipe],
	changeDetection: ChangeDetectionStrategy.OnPush,
	templateUrl: './programme-impression.component.html',
	styleUrl: './programme-impression.component.css'
})
export class ProgrammeImpressionComponent {

	private readonly programmeService = inject(ProgrammeService);
	private readonly route = inject(ActivatedRoute);
	private readonly title = inject(Title);
	private readonly translate = inject(TranslateService);

	/** Détail du programme (null tant que non chargé ou en erreur). */
	protected readonly detail = signal<ProgrammeDetail | null>(null);
	protected readonly loading = signal(true);
	protected readonly error = signal(false);

	/** Titre du document : « Nom Prénom » de l'athlète (vide tant que non chargé). */
	protected readonly athleteName = computed<string>(() => {
		const d = this.detail();
		return d ? `${d.athleteLastName} ${d.athleteFirstName}` : '';
	});

	/**
	 * Semaines prêtes pour l'affichage, triées par `weekNumber` croissant ; pour chacune,
	 * les numéros de séance et les lignes/cellules pivot construits via l'utilitaire partagé.
	 */
	protected readonly weeks = computed<readonly ImpressionWeek[]>(() => {
		const d = this.detail();
		if (!d) {
			return [];
		}
		return [...d.programmeWeeks]
			.sort((a, b) => a.weekNumber - b.weekNumber)
			.map((week) => ({
				week,
				trainingNumbers: trainingNumbersOf(week),
				rows: gridRowsOf(week)
			}));
	});

	constructor() {
		const id = Number(this.route.snapshot.paramMap.get('id'));
		if (Number.isNaN(id)) {
			this.loading.set(false);
			this.error.set(true);
		} else {
			void this.load(id);
		}
	}

	/** Charge le détail du programme ; en cas d'échec, bascule sur l'état d'erreur. */
	private async load(id: number): Promise<void> {
		this.loading.set(true);
		this.error.set(false);
		try {
			const detail = await this.programmeService.getDetail(id);
			this.detail.set(detail);
			this.applyDocumentTitle();
		} catch {
			this.detail.set(null);
			this.error.set(true);
		} finally {
			this.loading.set(false);
		}
	}

	/**
	 * Positionne le titre du document de façon autonome : cette route étant **hors**
	 * {@link LayoutComponent}, son `data.title` n'est jamais consommé. On réutilise la
	 * clé i18n existante `programmes.impression.title`, enrichie du nom de l'athlète, et
	 * on reprend le suffixe « — OBC Planner » du layout pour rester cohérent.
	 */
	private applyDocumentTitle(): void {
		const base = this.translate.instant('programmes.impression.title');
		const athlete = this.athleteName();
		const screen = athlete ? `${base} — ${athlete}` : base;
		this.title.setTitle(`${screen} — OBC Planner`);
	}
}
