import {inject, Injectable, Signal} from '@angular/core';
import {HttpClient, httpResource, HttpResourceRef} from '@angular/common/http';
import {firstValueFrom} from 'rxjs';
import {PlanningFilter, RefPlanning, RefPlanningRequest} from '../models/planning.model';
import {GridFilter, PageResponse} from '../models/data-grid.model';

/** Base de l'API planning de référence (context-path /api). */
const REF_PLANNINGS_URL = '/api/ref-plannings';

/**
 * Service HTTP du domaine « planning de référence » (ref_plannings).
 * La lecture de la liste est réactive via {@link httpResource} : le parent fournit
 * un signal de critères, et la ressource se recharge automatiquement à chaque changement.
 * Les mutations (create/update/delete) sont impératives et renvoient des Promises.
 */
@Injectable({providedIn: 'root'})
export class PlanningService {

  private readonly http = inject(HttpClient);

  /**
   * Crée une ressource réactive listant les lignes de planning selon les critères fournis.
   * @param query signal combinant le filtre métier ({@link PlanningFilter}) et le
   *              filtre de grille ({@link GridFilter} : pagination et tri).
   */
  getAll(query: Signal<PlanningFilter & GridFilter>): HttpResourceRef<PageResponse<RefPlanning> | undefined> {
    return httpResource<PageResponse<RefPlanning>>(() => {
      const q = query();
      const params: Record<string, string> = {
        page: String(q.page),
        size: String(q.size)
      };
      if (q.weeksNumbers != null) {
        params['weeksNumbers'] = String(q.weeksNumbers);
      }
      if (q.trainingOrder != null) {
        params['trainingOrder'] = String(q.trainingOrder);
      }
      if (q.sort) {
        params['sort'] = q.sort;
      }
      return {url: REF_PLANNINGS_URL, params};
    });
  }

  /** Récupère une ligne de planning par son identifiant. */
  getById(refPlanningId: number): Promise<RefPlanning> {
    return firstValueFrom(this.http.get<RefPlanning>(`${REF_PLANNINGS_URL}/${refPlanningId}`));
  }

  /** Crée une ligne de planning. */
  create(request: RefPlanningRequest): Promise<RefPlanning> {
    return firstValueFrom(this.http.post<RefPlanning>(REF_PLANNINGS_URL, request));
  }

  /** Modifie une ligne de planning existante. */
  update(refPlanningId: number, request: RefPlanningRequest): Promise<RefPlanning> {
    return firstValueFrom(this.http.put<RefPlanning>(`${REF_PLANNINGS_URL}/${refPlanningId}`, request));
  }

  /** Supprime une ligne de planning. */
  delete(refPlanningId: number): Promise<void> {
    return firstValueFrom(this.http.delete<void>(`${REF_PLANNINGS_URL}/${refPlanningId}`));
  }
}
