import {Pipe, PipeTransform, inject} from '@angular/core';
import {DomSanitizer, SafeHtml} from '@angular/platform-browser';

/**
 * Marque une chaîne HTML de confiance comme sûre pour l'injection dans le DOM.
 *
 * À utiliser exclusivement sur du contenu maîtrisé (constantes, markup issu de
 * librairies de confiance) — jamais sur une entrée utilisateur, car le pipe
 * court-circuite la sanitisation d'Angular.
 *
 * Usage — via un binding de propriété (et NON en interpolation `{{ }}`, qui
 * afficherait le HTML sous forme de texte brut) :
 *
 * ```html
 * <span [innerHTML]="monHtml | sanitizeHtml"></span>
 * ```
 */
@Pipe({
  name: 'sanitizeHtml',
  standalone: true
})
export class SanitizeHtmlPipe implements PipeTransform {
  private readonly sanitizer = inject(DomSanitizer);

  transform(value: string | null | undefined): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(value ?? '');
  }
}
