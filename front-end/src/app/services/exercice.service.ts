import {inject, Injectable, Signal} from '@angular/core';
import {HttpClient, httpResource, HttpResourceRef} from '@angular/common/http';
import {firstValueFrom} from 'rxjs';
import {Exercice, ExerciceFilter, ExerciceRequest} from '../models/exercice.model';
import {GridFilter, PageResponse} from '../models/data-grid.model';

/** Base de l'API exercices (context-path /api, proxy en dev). */
const EXERCICES_URL = '/api/exercices';

/**
 * Service HTTP du domaine « exercices de référence ».
 * La lecture de la liste est réactive via {@link httpResource} ; les mutations
 * (create/update/delete) sont impératives et renvoient des Promises.
 */
@Injectable({providedIn: 'root'})
export class ExerciceService {

  private readonly http = inject(HttpClient);

  /**
   * Crée une ressource réactive listant les exercices selon les critères fournis.
   * @param query signal combinant le filtre métier ({@link ExerciceFilter}) et le
   *              filtre de grille ({@link GridFilter} : pagination et tri).
   */
  getAll(query: Signal<ExerciceFilter & GridFilter>): HttpResourceRef<PageResponse<Exercice> | undefined> {
    return httpResource<PageResponse<Exercice>>(() => {
      const q = query();
      const params: Record<string, string> = {
        page: String(q.page),
        size: String(q.size)
      };
      if (q.typeExercice) {
        params['typeExercice'] = q.typeExercice;
      }
      if (q.categorieExercice) {
        params['categorieExercice'] = q.categorieExercice;
      }
      if (q.sort) {
        params['sort'] = q.sort;
      }
      return {url: EXERCICES_URL, params};
    });
  }

  /** Récupère un exercice par son identifiant. */
  getById(exerciceId: number): Promise<Exercice> {
    return firstValueFrom(this.http.get<Exercice>(`${EXERCICES_URL}/${exerciceId}`));
  }

  /** Crée un exercice. */
  create(request: ExerciceRequest): Promise<Exercice> {
    return firstValueFrom(this.http.post<Exercice>(EXERCICES_URL, request));
  }

  /** Modifie un exercice existant. */
  update(exerciceId: number, request: ExerciceRequest): Promise<Exercice> {
    return firstValueFrom(this.http.put<Exercice>(`${EXERCICES_URL}/${exerciceId}`, request));
  }

  /** Supprime un exercice. */
  delete(exerciceId: number): Promise<void> {
    return firstValueFrom(this.http.delete<void>(`${EXERCICES_URL}/${exerciceId}`));
  }
}
