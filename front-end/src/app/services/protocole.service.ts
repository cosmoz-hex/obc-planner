import {inject, Injectable, Signal} from '@angular/core';
import {HttpClient, httpResource, HttpResourceRef} from '@angular/common/http';
import {firstValueFrom} from 'rxjs';
import {Archetype, ProtocoleFilter, RefExercice, RefExerciceRequest} from '../models/protocole.model';
import {GridFilter, PageResponse} from '../models/data-grid.model';

/** Base de l'API protocoles / exercices de référence (context-path /api). */
const REF_EXERCICES_URL = '/api/ref-exercices';

/**
 * Service HTTP du domaine « protocoles » (exercices de référence et leurs séries).
 * La lecture de la liste est réactive via {@link httpResource} : le parent fournit
 * un signal de critères, et la ressource se recharge automatiquement à chaque changement.
 * Les mutations (create/update/delete) sont impératives et renvoient des Promises.
 */
@Injectable({providedIn: 'root'})
export class ProtocoleService {

  private readonly http = inject(HttpClient);

  /**
   * Crée une ressource réactive listant les exercices de référence selon les critères fournis.
   * @param query signal combinant le filtre métier ({@link ProtocoleFilter}) et le
   *              filtre de grille ({@link GridFilter} : pagination et tri).
   */
  getAll(query: Signal<ProtocoleFilter & GridFilter>): HttpResourceRef<PageResponse<RefExercice> | undefined> {
    return httpResource<PageResponse<RefExercice>>(() => {
      const q = query();
      const params: Record<string, string> = {
        page: String(q.page),
        size: String(q.size)
      };
      if (q.exerciceType) {
        params['exerciceType'] = q.exerciceType;
      }
      if (q.weekType) {
        params['weekType'] = q.weekType;
      }
      if (q.goal) {
        params['goal'] = q.goal;
      }
      if (q.archetype) {
        params['archetype'] = q.archetype;
      }
      if (q.sort) {
        params['sort'] = q.sort;
      }
      return {url: REF_EXERCICES_URL, params};
    });
  }

  /** Récupère un exercice de référence (et ses séries) par son identifiant. */
  getById(refExerciceId: number): Promise<RefExercice> {
    return firstValueFrom(this.http.get<RefExercice>(`${REF_EXERCICES_URL}/${refExerciceId}`));
  }

  /** Crée un exercice de référence et ses séries. */
  create(request: RefExerciceRequest): Promise<RefExercice> {
    return firstValueFrom(this.http.post<RefExercice>(REF_EXERCICES_URL, request));
  }

  /** Modifie un exercice de référence existant et ses séries. */
  update(refExerciceId: number, request: RefExerciceRequest): Promise<RefExercice> {
    return firstValueFrom(this.http.put<RefExercice>(`${REF_EXERCICES_URL}/${refExerciceId}`, request));
  }

  /** Supprime un exercice de référence (et toutes ses séries). */
  delete(refExerciceId: number): Promise<void> {
    return firstValueFrom(this.http.delete<void>(`${REF_EXERCICES_URL}/${refExerciceId}`));
  }

  /**
   * Supprime les séries d'un archétype donné pour un exercice de référence.
   * Côté backend, si l'exercice n'a plus aucune série, il est supprimé.
   */
  deleteArchetypeSets(refExerciceId: number, archetype: Archetype): Promise<void> {
    return firstValueFrom(
      this.http.delete<void>(`${REF_EXERCICES_URL}/${refExerciceId}/sets`, {params: {archetype}})
    );
  }
}
