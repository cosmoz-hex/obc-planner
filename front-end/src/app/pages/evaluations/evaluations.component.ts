import {
	ChangeDetectionStrategy,
	Component,
	computed,
	CUSTOM_ELEMENTS_SCHEMA,
	inject,
	signal,
	TemplateRef,
	viewChild
} from '@angular/core';
import {TranslatePipe} from '@ngx-translate/core';
import {DataGridComponent} from '../../components/data-grid/data-grid.component';
import {ColumnDef, GridFilter, SortState} from '../../models/data-grid.model';
import {EvaluationService} from '../../services/evaluation.service';
import {LocalizedDatePipe} from '../../pipes/localized-date.pipe';
import {EvaluationWizardDialogComponent} from './wizard/evaluation-wizard-dialog.component';
import {Evaluation} from '../../models/evaluation.model';

// Composants WebAwesome utilisés (enregistrement ciblé).
import '@awesome.me/webawesome/dist/components/button/button.js';
import '@awesome.me/webawesome/dist/components/icon/icon.js';
import '@awesome.me/webawesome/dist/components/tag/tag.js';
import '@awesome.me/webawesome/dist/components/badge/badge.js';

@Component({
  selector: 'app-evaluations',
  standalone: true,
  imports: [TranslatePipe, DataGridComponent, EvaluationWizardDialogComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './evaluations.component.html',
  host: {class: 'flex flex-1 min-h-0'},
  providers: [LocalizedDatePipe]
})
export class EvaluationsComponent {

  private readonly evaluationService = inject(EvaluationService);
  private readonly localizedDatePipe = inject(LocalizedDatePipe);

  /** Identité d'une ligne du grid : l'identifiant de l'évaluation. */
  protected readonly rowId = (evaluation: Evaluation): number => evaluation.evaluationId;

  // --- Pagination / tri (server-side) ---
  protected readonly page = signal(0);
  protected readonly pageSize = signal(10);
  /** Tri initial : date d'évaluation décroissante (cohérent avec le défaut backend). */
  protected readonly sort = signal<SortState | null>({key: 'evaluationDate', direction: 'desc'});

  /** Filtre de grille (pagination + tri) piloté par la ressource HTTP. */
  private readonly gridFilter = computed<GridFilter>(() => ({
    page: this.page(),
    size: this.pageSize(),
    sort: this.sort() ? `${this.sort()!.key},${this.sort()!.direction}` : null
  }));

  /** Ressource réactive : se recharge automatiquement quand le filtre change. */
  protected readonly evaluationsResource = this.evaluationService.getAll(this.gridFilter);

  protected readonly rows = computed<readonly Evaluation[]>(() => this.evaluationsResource.value()?.content ?? []);
  protected readonly totalElements = computed(() => this.evaluationsResource.value()?.totalElements ?? 0);
  protected readonly loading = computed(() => this.evaluationsResource.isLoading());

  // Templates de cellule déclarés dans le HTML de la page.
  private readonly archetypeTpl = viewChild<TemplateRef<{ $implicit: Evaluation }>>('archetypeCell');
  private readonly strengthSpeedTpl = viewChild<TemplateRef<{ $implicit: Evaluation }>>('strengthSpeedCell');
  private readonly techniqueTpl = viewChild<TemplateRef<{ $implicit: Evaluation }>>('techniqueCell');
  private readonly enduranceTpl = viewChild<TemplateRef<{ $implicit: Evaluation }>>('enduranceCell');
  private readonly psychoTpl = viewChild<TemplateRef<{ $implicit: Evaluation }>>('psychoCell');

  /**
   * Définition des colonnes, dérivée des templates de cellule. Retourne `[]` tant
   * que les templates ne sont pas disponibles (premier rendu).
   */
  protected readonly columns = computed<readonly ColumnDef<Evaluation>[]>(() => {
    // Recrée les formatters lorsque la langue active change.
    this.localizedDatePipe.currentLocale();
    const archetype = this.archetypeTpl();
    const strengthSpeed = this.strengthSpeedTpl();
    const technique = this.techniqueTpl();
    const endurance = this.enduranceTpl();
    const psycho = this.psychoTpl();
    if (!archetype || !strengthSpeed || !technique || !endurance || !psycho) {
      return [];
    }
    return [
      {
        key: 'lastName',
        headerLabel: 'evaluations.fields.name',
        sortable: true,
        hideable: false,
        formatter: (e) => `${e.firstName} ${e.lastName}`
      },
      {
        key: 'evaluationDate',
        headerLabel: 'evaluations.fields.evaluationDate',
        sortable: true,
        align: 'center',
        formatter: (e) => e.evaluationDate
          ? (this.localizedDatePipe.transform(e.evaluationDate, 'shortDate') ?? '—')
          : '—'
      },
      {key: 'archetype', headerLabel: 'evaluations.fields.archetype', sortable: true, align: 'center', cellTemplate: archetype},
      {key: 'strengthSpeed', headerLabel: 'evaluations.fields.strengthSpeed', sortable: true, align: 'center', cellTemplate: strengthSpeed},
      {key: 'technique', headerLabel: 'evaluations.fields.technique', sortable: true, align: 'center', cellTemplate: technique},
      {key: 'endurance', headerLabel: 'evaluations.fields.endurance', sortable: true, align: 'center', cellTemplate: endurance},
      {key: 'psycho', headerLabel: 'evaluations.fields.psycho', align: 'center', cellTemplate: psycho}
    ];
  });

  // --- Pagination / tri (server-side) ---
  protected onPageSizeChange(): void {
    // Le grid a déjà mis à jour `pageSize` (double binding) ; on revient page 1.
    this.page.set(0);
  }

  protected onSortChange(sort: SortState): void {
    this.sort.set(sort);
    this.page.set(0);
  }

  // --- Wizard d'ajout d'évaluation ---
  protected readonly wizardOpen = signal(false);

  protected openWizard(): void {
    this.wizardOpen.set(true);
  }

  protected closeWizard(): void {
    this.wizardOpen.set(false);
  }

  protected onWizardValidated(): void {
    // Placeholder : la persistance sera branchée quand les étapes porteront un
    // vrai formulaire. Pour l'instant on ferme simplement la modale.
    this.wizardOpen.set(false);
  }
}
