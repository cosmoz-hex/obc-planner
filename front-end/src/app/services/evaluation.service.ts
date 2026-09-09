import {Injectable, Signal} from '@angular/core';
import {httpResource, HttpResourceRef} from '@angular/common/http';
import {Evaluation} from '../models/evaluation.model';
import {GridFilter, PageResponse} from '../models/data-grid.model';

/** Base de l'API évaluations (context-path /api). */
const EVALUATIONS_URL = '/api/evaluations';

/**
 * Service HTTP du domaine « évaluations » (lecture seule).
 * La liste est réactive via {@link httpResource} : le parent fournit un signal
 * de critères de grille (pagination + tri) et la ressource se recharge
 * automatiquement à chaque changement.
 */
@Injectable({providedIn: 'root'})
export class EvaluationService {

  /**
   * Crée une ressource réactive listant les évaluations selon le filtre de
   * grille fourni (pagination et tri).
   */
  getAll(query: Signal<GridFilter>): HttpResourceRef<PageResponse<Evaluation> | undefined> {
    return httpResource<PageResponse<Evaluation>>(() => {
      const q = query();
      const params: Record<string, string> = {
        page: String(q.page),
        size: String(q.size)
      };
      if (q.sort) {
        params['sort'] = q.sort;
      }
      return {url: EVALUATIONS_URL, params};
    });
  }
}
