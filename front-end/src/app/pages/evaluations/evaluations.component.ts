import {
	ChangeDetectionStrategy,
	Component,
	computed,
	CUSTOM_ELEMENTS_SCHEMA,
	ElementRef,
	inject,
	signal,
	TemplateRef,
	viewChild
} from '@angular/core';
import {TranslatePipe, TranslateService} from '@ngx-translate/core';
import {DataGridComponent} from '../../components/data-grid/data-grid.component';
import {ColumnDef, CellClickEvent, GridFilter, SortState} from '../../models/data-grid.model';
import {EvaluationService} from '../../services/evaluation.service';
import {LocalizedDatePipe} from '../../pipes/localized-date.pipe';
import {EvaluationWizardDialogComponent} from './wizard/dialog/evaluation-wizard-dialog.component';
import {ConfirmDialogComponent} from '../../components/confirm-dialog/confirm-dialog.component';
import {Evaluation} from '../../models/evaluation.model';
import {EvaluationDetail} from '../../models/evaluation-detail.model';
import {EvaluationRequest} from '../../models/evaluation-request.model';

// Composants WebAwesome utilisés (enregistrement ciblé).
import '@awesome.me/webawesome/dist/components/button/button.js';
import '@awesome.me/webawesome/dist/components/icon/icon.js';
import '@awesome.me/webawesome/dist/components/tag/tag.js';
import '@awesome.me/webawesome/dist/components/badge/badge.js';
import '@awesome.me/webawesome/dist/components/dropdown/dropdown.js';
import '@awesome.me/webawesome/dist/components/dropdown-item/dropdown-item.js';
import '@awesome.me/webawesome/dist/components/toast/toast.js';
import type WaToast from '@awesome.me/webawesome/dist/components/toast/toast.js';

@Component({
  selector: 'app-evaluations',
  standalone: true,
  imports: [TranslatePipe, DataGridComponent, EvaluationWizardDialogComponent, ConfirmDialogComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './evaluations.component.html',
  host: {class: 'flex flex-1 min-h-0'},
  providers: [LocalizedDatePipe]
})
export class EvaluationsComponent {

  private readonly evaluationService = inject(EvaluationService);
  private readonly translate = inject(TranslateService);
  private readonly localizedDatePipe = inject(LocalizedDatePipe);

  /** Identité d'une ligne du grid : l'identifiant de l'évaluation. */
  protected readonly rowId = (evaluation: Evaluation): number => evaluation.evaluationId;

  /** Traduction impérative (pour aria-label). */
  protected t(key: string): string {
    return this.translate.instant(key);
  }

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
  private readonly actionsTpl = viewChild<TemplateRef<{ $implicit: Evaluation }>>('actionsCell');

  /** Référence au conteneur de toasts (notifications non bloquantes, auto-dismiss). */
  private readonly errorToast = viewChild<ElementRef<WaToast>>('errorToast');

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
    const actions = this.actionsTpl();
    if (!archetype || !strengthSpeed || !technique || !endurance || !psycho || !actions) {
      return [];
    }
    return [
      {
        key: 'lastName',
        headerLabel: 'evaluations.fields.name',
        sortable: true,
        hideable: false,
        cellClass: 'cursor-pointer',
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
      {key: 'psycho', headerLabel: 'evaluations.fields.psycho', align: 'center', cellTemplate: psycho},
      {key: 'actions', headerLabel: 'evaluations.fields.actions', hideable: false, align: 'end', width: '5%', cellTemplate: actions}
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

  // --- Wizard d'ajout / modification d'évaluation ---
  protected readonly wizardOpen = signal(false);
  protected readonly wizardMode = signal<'create' | 'edit'>('create');
  /** Évaluation complète chargée pour l'édition (null en création). */
  protected readonly editingEvaluation = signal<EvaluationDetail | null>(null);

  protected openWizard(): void {
    this.wizardMode.set('create');
    this.editingEvaluation.set(null);
    this.wizardOpen.set(true);
  }

  /** Ouvre le wizard en édition après récupération de l'évaluation complète. */
  protected async openEdit(evaluation: Evaluation): Promise<void> {
    try {
      const full = await this.evaluationService.getById(evaluation.evaluationId);
      this.editingEvaluation.set(full);
      this.wizardMode.set('edit');
      this.wizardOpen.set(true);
    } catch {
      void this.errorToast()?.nativeElement.create(this.t('evaluations.errors.load'), {
        variant: 'danger',
        icon: 'triangle-exclamation'
      });
    }
  }

  /** Clic sur la cellule « nom & prénom » → édition de l'évaluation. */
  protected onCellClick(event: CellClickEvent<Evaluation>): void {
    if (event.column.key === 'lastName') {
      void this.openEdit(event.row);
    }
  }

  protected closeWizard(): void {
    this.wizardOpen.set(false);
  }

  protected async onWizardValidated(request: EvaluationRequest): Promise<void> {
    const editing = this.editingEvaluation();
    if (editing) {
      await this.evaluationService.update(editing.evaluationId, request);
    } else {
      await this.evaluationService.create(request);
    }
    this.wizardOpen.set(false);
    // Rafraîchit la liste pour refléter l'ajout ou la modification.
    this.evaluationsResource.reload();
  }

  // --- Suppression ---
  protected readonly confirmOpen = signal(false);
  protected readonly evaluationToDelete = signal<Evaluation | null>(null);

  /** Route l'action choisie dans le menu d'action de la ligne. */
  protected onRowAction(evaluation: Evaluation, event: Event): void {
    const detail = (event as CustomEvent<{ item?: Element }>).detail;
    const action = detail?.item?.getAttribute('value');
    if (action === 'edit') {
      void this.openEdit(evaluation);
    } else if (action === 'delete') {
      this.askDelete(evaluation);
    }
  }

  protected askDelete(evaluation: Evaluation): void {
    this.evaluationToDelete.set(evaluation);
    this.confirmOpen.set(true);
  }

  protected cancelDelete(): void {
    this.confirmOpen.set(false);
    this.evaluationToDelete.set(null);
  }

  protected async confirmDelete(): Promise<void> {
    const evaluation = this.evaluationToDelete();
    this.confirmOpen.set(false);
    if (!evaluation) {
      return;
    }
    try {
      await this.evaluationService.delete(evaluation.evaluationId);
      this.evaluationsResource.reload();
    } catch {
      // Notification non bloquante, fermable et auto-dismiss (5 s par défaut).
      void this.errorToast()?.nativeElement.create(this.t('evaluations.errors.delete'), {
        variant: 'danger',
        icon: 'triangle-exclamation'
      });
    } finally {
      this.evaluationToDelete.set(null);
    }
  }
}
