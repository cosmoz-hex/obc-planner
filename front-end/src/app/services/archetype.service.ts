import {inject, Injectable, Signal} from '@angular/core';
import {HttpClient, httpResource, HttpResourceRef} from '@angular/common/http';
import {firstValueFrom} from 'rxjs';
import {ArchetypeFilter, RefArchetype, RefArchetypeRequest} from '../models/archetype.model';
import {GridFilter, PageResponse} from '../models/data-grid.model';

/** Base de l'API archétypes (routée vers le backend via proxy en dev, context-path /api). */
const REF_ARCHETYPES_URL = '/api/ref-archetypes';

/**
 * Service HTTP du domaine « archétypes de référence ».
 * La lecture de la liste est réactive via {@link httpResource} : le parent fournit
 * un signal de critères, et la ressource se recharge automatiquement à chaque changement.
 * Les mutations (create/update/delete) sont impératives et renvoient des Promises.
 */
@Injectable({providedIn: 'root'})
export class ArchetypeService {

  private readonly http = inject(HttpClient);

  /**
   * Crée une ressource réactive listant les archétypes selon les critères fournis.
   * @param query signal combinant le filtre métier ({@link ArchetypeFilter}) et le
   *              filtre de grille ({@link GridFilter} : pagination et tri).
   */
  getAll(query: Signal<ArchetypeFilter & GridFilter>): HttpResourceRef<PageResponse<RefArchetype> | undefined> {
    return httpResource<PageResponse<RefArchetype>>(() => {
      const q = query();
      const params: Record<string, string> = {
        page: String(q.page),
        size: String(q.size)
      };
      if (q.archetype) {
        params['archetype'] = q.archetype;
      }
      if (q.strengthSpeed) {
        params['strengthSpeed'] = q.strengthSpeed;
      }
      if (q.technique) {
        params['technique'] = q.technique;
      }
      if (q.endurance) {
        params['endurance'] = q.endurance;
      }
      if (q.sort) {
        params['sort'] = q.sort;
      }
      return {url: REF_ARCHETYPES_URL, params};
    });
  }

  /** Récupère un archétype par son identifiant. */
  getById(refArchetypeId: number): Promise<RefArchetype> {
    return firstValueFrom(this.http.get<RefArchetype>(`${REF_ARCHETYPES_URL}/${refArchetypeId}`));
  }

  /** Crée un archétype. */
  create(request: RefArchetypeRequest): Promise<RefArchetype> {
    return firstValueFrom(this.http.post<RefArchetype>(REF_ARCHETYPES_URL, request));
  }

  /** Modifie un archétype existant. */
  update(refArchetypeId: number, request: RefArchetypeRequest): Promise<RefArchetype> {
    return firstValueFrom(this.http.put<RefArchetype>(`${REF_ARCHETYPES_URL}/${refArchetypeId}`, request));
  }

  /** Supprime un archétype. */
  delete(refArchetypeId: number): Promise<void> {
    return firstValueFrom(this.http.delete<void>(`${REF_ARCHETYPES_URL}/${refArchetypeId}`));
  }
}
