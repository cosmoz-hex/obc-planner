import {ChangeDetectionStrategy, Component, CUSTOM_ELEMENTS_SCHEMA, input, output} from '@angular/core';
import {NgClass, NgTemplateOutlet} from '@angular/common';
import {TranslatePipe} from '@ngx-translate/core';
import {CellClickEvent, ColumnDef, SortDirection, SortState} from './data-grid.types';

// Composants WebAwesome utilisés par ce grid (enregistrement ciblé).
import '@awesome.me/webawesome/dist/components/icon/icon.js';
import '@awesome.me/webawesome/dist/components/select/select.js';
import '@awesome.me/webawesome/dist/components/option/option.js';
import '@awesome.me/webawesome/dist/components/spinner/spinner.js';
import '@awesome.me/webawesome/dist/components/pagination/pagination.js';

/**
 * Data-grid réutilisable inspiré d'AG Grid, piloté par le parent.
 *
 * La pagination et le tri sont gérés CÔTÉ SERVEUR : le composant n'effectue
 * aucun tri ni découpage local, il émet des événements que le parent traduit
 * en requêtes. Rendu en <table> HTML natif accessible (thead / th scope / aria-sort).
 *
 * @template T type d'une ligne de données.
 */
@Component({
  selector: 'app-data-grid',
  standalone: true,
  imports: [NgClass, NgTemplateOutlet, TranslatePipe],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './data-grid.component.html',
  host: {class: 'block'}
})
export class DataGridComponent<T> {

  /** Lignes de la page courante (déjà paginées côté serveur). */
  readonly rows = input.required<readonly T[]>();
  /** Définition des colonnes. */
  readonly columns = input.required<readonly ColumnDef<T>[]>();
  /** Libellé accessible du tableau (clé i18n). */
  readonly caption = input<string>('');
  /** Indique un chargement en cours. */
  readonly loading = input<boolean>(false);

  /** Numéro de page courant (0-based, comme Spring). */
  readonly page = input<number>(0);
  /** Taille de page courante. */
  readonly pageSize = input<number>(10);
  /** Options de taille de page. */
  readonly pageSizeOptions = input<readonly number[]>([10, 25, 50]);
  /** Nombre total d'éléments (toutes pages). */
  readonly totalElements = input<number>(0);

  /** État de tri courant (ou null). */
  readonly sort = input<SortState | null>(null);

  /**
   * Rend les lignes interactives (cliquables + navigables au clavier) et émet
   * `rowClick`. Laisser à false si la navigation passe par un contrôle dans une
   * cellule (ex. lien/bouton), pour éviter une action de ligne non accessible.
   */
  readonly rowInteractive = input<boolean>(false);

  /** Identité d'une ligne pour le suivi du rendu (défaut : index). */
  readonly rowId = input<(row: T, index: number) => unknown>((_, index) => index);

  /** Émis lors d'un changement de page (nouvelle page 0-based). */
  readonly pageChange = output<number>();
  /** Émis lors d'un changement de taille de page. */
  readonly pageSizeChange = output<number>();
  /** Émis lors d'un changement de tri. */
  readonly sortChange = output<SortState>();
  /** Émis lors d'un clic sur une ligne. */
  readonly rowClick = output<T>();
  /** Émis lors d'un clic sur une cellule. */
  readonly cellClick = output<CellClickEvent<T>>();

  /** Rendu texte d'une cellule (hors template custom). */
  protected renderCell(row: T, column: ColumnDef<T>): string {
    if (column.formatter) {
      return column.formatter(row);
    }
    const raw = column.value ? column.value(row) : (row as Record<string, unknown>)[column.key];
    return raw == null ? '' : String(raw);
  }

  /** Classe(s) CSS d'une cellule, résolue(s) depuis `cellClass` (statique ou fonction). */
  protected cellClass(row: T, column: ColumnDef<T>): string[] {
    const value = typeof column.cellClass === 'function' ? column.cellClass(row) : column.cellClass;
    return value ? ([] as string[]).concat(value as string | string[]) : [];
  }

  /** Classe(s) CSS d'un en-tête, résolue(s) depuis `headerClass`. */
  protected headerClass(column: ColumnDef<T>): string[] {
    return column.headerClass ? ([] as string[]).concat(column.headerClass as string | string[]) : [];
  }

  /** Valeur de l'attribut aria-sort pour une colonne. */
  protected ariaSort(column: ColumnDef<T>): 'ascending' | 'descending' | 'none' {
    const current = this.sort();
    if (!column.sortable || !current || current.key !== column.key) {
      return 'none';
    }
    return current.direction === 'asc' ? 'ascending' : 'descending';
  }

  /** Bascule le tri d'une colonne triable et émet le nouvel état. */
  protected onSort(column: ColumnDef<T>): void {
    if (!column.sortable) {
      return;
    }
    const current = this.sort();
    const direction: SortDirection =
      current && current.key === column.key && current.direction === 'asc' ? 'desc' : 'asc';
    this.sortChange.emit({key: column.key, direction});
  }

  /** Convertit l'événement de pagination WebAwesome (page 1-based) en page 0-based. */
  protected onWaPageChange(event: Event): void {
    const detail = (event as CustomEvent<{ page: number }>).detail;
    if (detail && Number.isFinite(detail.page)) {
      const zeroBased = detail.page - 1;
      if (zeroBased !== this.page()) {
        this.pageChange.emit(zeroBased);
      }
    }
  }

  protected onPageSizeChange(event: Event): void {
    const value = (event.target as { value?: string | string[] | null }).value;
    const raw = Array.isArray(value) ? value[0] : value;
    const size = Number(raw);
    if (size && size !== this.pageSize()) {
      this.pageSizeChange.emit(size);
    }
  }

  protected onRowClick(row: T): void {
    if (this.rowInteractive()) {
      this.rowClick.emit(row);
    }
  }

  /** Active la ligne au clavier (Enter/Espace) si elle est interactive. */
  protected onRowKeydown(row: T, event: KeyboardEvent): void {
    if (!this.rowInteractive()) {
      return;
    }
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.rowClick.emit(row);
    }
  }

  protected onCellClick(row: T, column: ColumnDef<T>): void {
    this.cellClick.emit({row, column});
  }

  /** Identité d'une ligne pour @for. */
  protected trackRow = (index: number, row: T): unknown => this.rowId()(row, index);

  /** trackBy pour les colonnes. */
  protected columnKey = (_: number, column: ColumnDef<T>): string => column.key;
}
