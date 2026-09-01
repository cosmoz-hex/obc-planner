import {TemplateRef} from '@angular/core';

/** Alignement horizontal du contenu d'une colonne. */
export type ColumnAlign = 'start' | 'center' | 'end';

/** Sens de tri d'une colonne. */
export type SortDirection = 'asc' | 'desc';

/**
 * Définition d'une colonne du data-grid.
 * @template T type de la ligne de données.
 */
export interface ColumnDef<T = unknown> {
  /** Clé technique de la colonne (utilisée pour le tri côté serveur). */
  readonly key: string;
  /** Clé i18n de l'en-tête de colonne. */
  readonly headerLabel: string;
  /** Largeur CSS optionnelle (ex. '120px', '20%'). */
  readonly width?: string;
  /** Alignement du contenu (défaut : 'start'). */
  readonly align?: ColumnAlign;
  /** Colonne triable côté serveur (défaut : false). */
  readonly sortable?: boolean;
  /**
   * Classe(s) CSS appliquée(s) à chaque cellule de la colonne.
   * Valeur statique (`string`/`string[]`) ou fonction évaluée par ligne pour un
   * style conditionnel dépendant de la donnée.
   */
  readonly cellClass?: string | readonly string[] | ((row: T) => string | readonly string[]);
  /** Classe(s) CSS appliquée(s) à l'en-tête de la colonne. */
  readonly headerClass?: string | readonly string[];
  /** Accès à la valeur brute de la cellule (défaut : row[key]). */
  readonly value?: (row: T) => unknown;
  /** Formatage texte de la valeur (ignoré si un cellTemplate est fourni). */
  readonly formatter?: (row: T) => string;
  /** Template custom de cellule (prioritaire sur formatter/value). */
  readonly cellTemplate?: TemplateRef<{ $implicit: T }>;
}

/** État de tri courant du grid. */
export interface SortState {
  readonly key: string;
  readonly direction: SortDirection;
}

/** Événement de clic sur une cellule. */
export interface CellClickEvent<T = unknown> {
  readonly row: T;
  readonly column: ColumnDef<T>;
}
