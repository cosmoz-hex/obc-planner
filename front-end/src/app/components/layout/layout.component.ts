import {Component, CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {RouterLink, RouterOutlet} from '@angular/router';

/**
 * Shell principal minimal : <wa-page> avec une navigation latérale pour le
 * routing et une zone de contenu routée. Volontairement sans style spécifique.
 */
@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './layout.component.html'
})
export class LayoutComponent {
}
