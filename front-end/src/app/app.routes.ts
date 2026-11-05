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
				loadComponent: () => import('./pages/athletes/athletes.component').then(m => m.AthletesComponent),
				data: {title: 'athletes.title'}
			},
			{
				path: 'evaluations',
				loadComponent: () => import('./pages/evaluations/evaluations.component').then(m => m.EvaluationsComponent),
				data: {title: 'evaluations.title'}
			},
			{
				path: 'referentiel',
				loadComponent: () => import('./pages/referentiel/referentiel.component').then(m => m.ReferentielComponent),
				data: {title: 'pages.referentiel.title'},
				children: [
					{path: '', redirectTo: 'archetypes', pathMatch: 'full'},
					{
						path: 'archetypes',
						loadComponent: () => import('./pages/referentiel/archetypes/archetypes.component').then(m => m.ArchetypesComponent),
						data: {title: 'pages.referentiel.title'}
					}, {
						path: 'planning',
						loadComponent: () => import('./pages/referentiel/planning/planning.component').then(m => m.PlanningComponent),
						data: {title: 'pages.referentiel.title'}
					}
				]
			}
		]
	}
];
