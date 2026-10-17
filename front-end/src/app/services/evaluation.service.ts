import {inject, Injectable, Signal} from '@angular/core';
import {HttpClient, httpResource, HttpResourceRef} from '@angular/common/http';
import {firstValueFrom} from 'rxjs';
import {Evaluation} from '../models/evaluation.model';
import {EvaluationRequest} from '../models/evaluation-request.model';
import {GridFilter, PageResponse} from '../models/data-grid.model';

/** Base de l'API évaluations (context-path /api). */
const EVALUATIONS_URL = '/api/evaluations';

/** Identifiant renvoyé à la création d'une évaluation (EvaluationCreatedResponse). */
interface EvaluationCreatedResponse {
  evaluationId: number;
}

/**
 * Service HTTP du domaine « évaluations ».
 * La liste est réactive via {@link httpResource} : le parent fournit un signal
 * de critères de grille (pagination + tri) et la ressource se recharge
 * automatiquement à chaque changement. La création est impérative (Promise).
 */
@Injectable({providedIn: 'root'})
export class EvaluationService {

  private readonly http = inject(HttpClient);

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

  /** Crée une évaluation (bilan + détail). Renvoie l'identifiant créé. */
  create(request: EvaluationRequest): Promise<EvaluationCreatedResponse> {
    return firstValueFrom(this.http.post<EvaluationCreatedResponse>(EVALUATIONS_URL, request));
  }

  /** Supprime une évaluation (détail supprimé en cascade côté serveur). */
  delete(evaluationId: number): Promise<void> {
    return firstValueFrom(this.http.delete<void>(`${EVALUATIONS_URL}/${evaluationId}`));
  }
}
