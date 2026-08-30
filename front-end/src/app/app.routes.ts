import {Routes} from '@angular/router';
import {LayoutComponent} from './components/layout/layout.component';

export const routes: Routes = [
	{
		path: '',
		component: LayoutComponent,
		children: [
			{path: '', redirectTo: 'athletes', pathMatch: 'full'},
			{
				path: 'athletes',
				loadComponent: () => import('./pages/athletes/athletes.component').then(m => m.AthletesComponent)
			},
			{
				path: 'referentiel',
				loadComponent: () => import('./pages/referentiel/referentiel.component').then(m => m.ReferentielComponent),
				children: [
					{path: '', redirectTo: 'archetypes', pathMatch: 'full'},
					{
						path: 'archetypes',
						loadComponent: () => import('./pages/referentiel/archetypes/archetypes.component').then(m => m.ArchetypesComponent)
					}, {
						path: 'correctifs',
						loadComponent: () => import('./pages/referentiel/correctifs/correctifs.component').then(m => m.CorrectifsComponent)
					}, {
						path: 'exercices',
						loadComponent: () => import('./pages/referentiel/exercices/exercices.component').then(m => m.ExercicesComponent)
					}, {
						path: 'trame-generale',
						loadComponent: () => import('./pages/referentiel/trame-generale/trame-generale.component').then(m => m.TrameGeneraleComponent)
					}
				]
			}
		]
	}
];
