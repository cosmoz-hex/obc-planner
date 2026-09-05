import {inject, Injectable, Signal} from '@angular/core';
import {HttpClient, httpResource, HttpResourceRef} from '@angular/common/http';
import {firstValueFrom} from 'rxjs';
import {Athlete, AthleteFilter, AthleteRequest} from '../models/athlete.model';
import {GridFilter, PageResponse} from '../models/data-grid.model';

/** Base de l'API athlètes (routée vers le backend via proxy en dev, context-path /api). */
const ATHLETES_URL = '/api/athletes';

/**
 * Service HTTP du domaine « athlètes ».
 * La lecture de la liste est réactive via {@link httpResource} : le parent fournit
 * un signal de critères, et la ressource se recharge automatiquement à chaque changement.
 * Les mutations (create/update/delete) sont impératives et renvoient des Promises.
 */
@Injectable({providedIn: 'root'})
export class AthleteService {

  private readonly http = inject(HttpClient);

  /**
   * Crée une ressource réactive listant les athlètes selon les critères fournis.
   * @param query signal combinant le filtre métier ({@link AthleteFilter}) et le
   *              filtre de grille ({@link GridFilter} : pagination et tri).
   */
  getAll(query: Signal<AthleteFilter & GridFilter>): HttpResourceRef<PageResponse<Athlete> | undefined> {
    return httpResource<PageResponse<Athlete>>(() => {
      const q = query();
      const params: Record<string, string> = {
        page: String(q.page),
        size: String(q.size)
      };
      if (q.sexe) {
        params['sexe'] = q.sexe;
      }
      if (q.ageCategorie) {
        params['ageCategorie'] = q.ageCategorie;
      }
      if (q.sort) {
        params['sort'] = q.sort;
      }
      return {url: ATHLETES_URL, params};
    });
  }

  /** Récupère un athlète par son identifiant. */
  getById(athleteId: number): Promise<Athlete> {
    return firstValueFrom(this.http.get<Athlete>(`${ATHLETES_URL}/${athleteId}`));
  }

  /** Crée un athlète. */
  create(request: AthleteRequest): Promise<Athlete> {
    return firstValueFrom(this.http.post<Athlete>(ATHLETES_URL, request));
  }

  /** Modifie un athlète existant. */
  update(athleteId: number, request: AthleteRequest): Promise<Athlete> {
    return firstValueFrom(this.http.put<Athlete>(`${ATHLETES_URL}/${athleteId}`, request));
  }

  /** Supprime un athlète. */
  delete(athleteId: number): Promise<void> {
    return firstValueFrom(this.http.delete<void>(`${ATHLETES_URL}/${athleteId}`));
  }
}
