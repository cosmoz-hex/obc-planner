import {inject, Injectable, Signal} from '@angular/core';
import {HttpClient, httpResource, HttpResourceRef} from '@angular/common/http';
import {firstValueFrom} from 'rxjs';
import {
  ProgrammeCellUpdateRequest,
  ProgrammeCreateRequest,
  ProgrammeDetail,
  ProgrammeFilter,
  ProgrammeRow
} from '../models/programme.model';
import {GridFilter, PageResponse} from '../models/data-grid.model';

/** Base de l'API programmes (routée vers le backend via proxy en dev, context-path /api). */
const PROGRAMMES_URL = '/api/programmes';

/**
 * Service HTTP du domaine « programmes d'entraînement ».
 * La lecture de la liste est réactive via {@link httpResource} : le parent fournit
 * un signal de critères, et la ressource se recharge automatiquement à chaque changement.
 * Les mutations (create/update/delete) sont impératives et renvoient des Promises.
 */
@Injectable({providedIn: 'root'})
export class ProgrammeService {

  private readonly http = inject(HttpClient);

  /**
   * Crée une ressource réactive listant les programmes selon les critères fournis.
   * @param query signal combinant le filtre métier ({@link ProgrammeFilter}) et le
   *              filtre de grille ({@link GridFilter} : pagination et tri).
   */
  getAll(query: Signal<ProgrammeFilter & GridFilter>): HttpResourceRef<PageResponse<ProgrammeRow> | undefined> {
    return httpResource<PageResponse<ProgrammeRow>>(() => {
      const q = query();
      const params: Record<string, string> = {
        page: String(q.page),
        size: String(q.size)
      };
      if (q.athleteId !== null) {
        params['athleteId'] = String(q.athleteId);
      }
      if (q.sort) {
        params['sort'] = q.sort;
      }
      return {url: PROGRAMMES_URL, params};
    });
  }

  /** Récupère le détail complet d'un programme par son identifiant. */
  getDetail(id: number): Promise<ProgrammeDetail> {
    return firstValueFrom(this.http.get<ProgrammeDetail>(`${PROGRAMMES_URL}/${id}`));
  }

  /** Crée un programme à partir d'une évaluation. */
  create(request: ProgrammeCreateRequest): Promise<ProgrammeRow> {
    return firstValueFrom(this.http.post<ProgrammeRow>(PROGRAMMES_URL, request));
  }

  /** Met à jour une cellule (séance) d'un programme et renvoie le détail à jour. */
  updateCell(id: number, request: ProgrammeCellUpdateRequest): Promise<ProgrammeDetail> {
    return firstValueFrom(this.http.put<ProgrammeDetail>(`${PROGRAMMES_URL}/${id}/cell`, request));
  }

  /** Supprime un programme. */
  remove(id: number): Promise<void> {
    return firstValueFrom(this.http.delete<void>(`${PROGRAMMES_URL}/${id}`));
  }
}
