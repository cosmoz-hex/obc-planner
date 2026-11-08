import {ProgrammeExercice, ProgrammeWeek} from '../../models/programme.model';

/**
 * Cellule de la grille pivot d'une semaine = intersection d'une séance
 * (`trainingNumber`) et d'une position d'exercice (`exerciceOrder`). Elle regroupe
 * les **exercices alternatifs** (« au choix ») de cette séance à cette position.
 *
 * Choix de typage : on conserve directement les {@link ProgrammeExercice} d'origine
 * (pas de type dérivé) — ils portent déjà tout le nécessaire à l'affichage (nom +
 * séries) et à l'édition (via `EditCellEvent`). Une seule représentation évite une
 * conversion et une divergence de types entre affichage et édition.
 */
export interface ProgrammeGridCell {
	readonly trainingNumber: number;
	readonly exerciceOrder: number;
	readonly exercices: readonly ProgrammeExercice[];
}

/**
 * Ligne de la grille pivot = une **position d'exercice** (`exerciceOrder`) commune à
 * toutes les séances de la semaine. Le champ `cells` contient une cellule par séance
 * (triées par `trainingNumber`).
 */
export interface ProgrammeGridRow {
	readonly exerciceOrder: number;
	/** Cellules de la ligne, une par séance de la semaine (triées par trainingNumber). */
	readonly cells: readonly ProgrammeGridCell[];
}

/**
 * Numéros de séance distincts d'une semaine, triés croissant.
 *
 * Fonction pure partagée entre la popup de consultation (grille pivot) et la page
 * d'impression, pour garantir le MÊME ordre de colonnes (parité d'information).
 */
export function trainingNumbersOf(week: ProgrammeWeek): readonly number[] {
	return [...new Set(week.trainings.map((trn) => trn.trainingNumber))].sort((a, b) => a - b);
}

/**
 * Lignes de la grille pivot d'une semaine : une par `exerciceOrder` distinct (toutes
 * séances confondues), triées croissant. Pour chaque ligne, une cellule par séance
 * regroupe les exercices alternatifs de cette séance à cette position (plusieurs =
 * « au choix »).
 *
 * Fonction pure : reproduit exactement la logique de tri/regroupement historiquement
 * portée par le `programme-detail-dialog`.
 */
export function gridRowsOf(week: ProgrammeWeek): readonly ProgrammeGridRow[] {
	const trainingNumbers = trainingNumbersOf(week);
	// Positions distinctes (toutes séances confondues), triées croissant.
	const orders = [...new Set(
		week.trainings.flatMap((trn) => trn.exercices.map((ex) => ex.exerciceOrder))
	)].sort((a, b) => a - b);

	return orders.map((exerciceOrder) => ({
		exerciceOrder,
		cells: trainingNumbers.map((trainingNumber) => {
			const training = week.trainings.find((trn) => trn.trainingNumber === trainingNumber);
			const exercices = (training?.exercices ?? [])
				.filter((ex) => ex.exerciceOrder === exerciceOrder);
			return {trainingNumber, exerciceOrder, exercices} satisfies ProgrammeGridCell;
		})
	} satisfies ProgrammeGridRow));
}
