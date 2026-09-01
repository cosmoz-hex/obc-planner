/**
 * Lit la valeur courante d'un événement émis par un composant WebAwesome
 * (`<wa-select>`, `<wa-input>`…), en normalisant le cas de la sélection multiple
 * (`string[]`) vers une chaîne simple.
 */
export function waEventValue(event: Event): string {
  const value = (event.target as { value?: string | string[] | null }).value;
  return Array.isArray(value) ? (value[0] ?? '') : (value ?? '');
}
