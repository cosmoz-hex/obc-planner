package com.example.backend.services.impl;

import com.example.backend.dto.PageResponse;
import com.example.backend.dto.RefExerciceRequest;
import com.example.backend.dto.RefExerciceResponse;
import com.example.backend.entities.RefExercice;
import com.example.backend.entities.RefExerciceSet;
import com.example.backend.enums.Archetype;
import com.example.backend.enums.ExerciceType;
import com.example.backend.enums.RefGoal;
import com.example.backend.enums.WeekTypeRef;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.repositories.RefExerciceRepository;
import com.example.backend.services.apis.RefExerciceService;
import com.example.backend.services.mapper.RefExerciceMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RefExerciceServiceImpl implements RefExerciceService {

    /**
     * Propriétés autorisées pour le tri côté serveur (protection contre le tri arbitraire).
     */
    private static final Set<String> SORTABLE_FIELDS =
            Set.of("exerciceType", "weekType", "goal", "trainingOrder", "exerciceName");

    /**
     * Taille de page maximale autorisée (protection contre les requêtes trop larges).
     */
    private static final int MAX_PAGE_SIZE = 100;

    private final RefExerciceRepository refExerciceRepository;
    private final RefExerciceMapper refExerciceMapper;

    @Override
    @Transactional(readOnly = true)
    public PageResponse<RefExerciceResponse> findAll(
            ExerciceType exerciceType,
            WeekTypeRef weekType,
            RefGoal goal,
            Archetype archetype,
            Pageable pageable
    ) {
        return PageResponse.from(
                refExerciceRepository.findAllFiltered(exerciceType, weekType, goal, archetype, sanitizeSort(pageable))
                        .map(refExerciceMapper::toResponse));
    }

    @Override
    @Transactional(readOnly = true)
    public RefExerciceResponse findById(Integer refExerciceId) {
        return refExerciceMapper.toResponse(getOrThrow(refExerciceId));
    }

    @Override
    @Transactional
    public RefExerciceResponse create(RefExerciceRequest request) {
        RefExercice saved = refExerciceRepository.save(refExerciceMapper.toEntity(request));
        return refExerciceMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public RefExerciceResponse update(Integer refExerciceId, RefExerciceRequest request) {
        RefExercice refExercice = getOrThrow(refExerciceId);
        refExerciceMapper.updateEntity(refExercice, request);

        List<RefExerciceSet> newSets = refExerciceMapper.setsFromRequest(request.sets());
        Set<Archetype> replacedArchetypes = newSets.stream()
                .map(RefExerciceSet::getArchetype)
                .collect(Collectors.toSet());

        // Remplace en bloc les séries des archétypes présents dans le payload
        // (orphanRemoval supprime les anciennes), laisse les autres archétypes intacts.
        refExercice.getSets().removeIf(set -> replacedArchetypes.contains(set.getArchetype()));
        newSets.forEach(set -> refExerciceMapper.addSet(refExercice, set));

        return refExerciceMapper.toResponse(refExerciceRepository.save(refExercice));
    }

    @Override
    @Transactional
    public void delete(Integer refExerciceId) {
        RefExercice refExercice = getOrThrow(refExerciceId);
        refExerciceRepository.delete(refExercice);
    }

    @Override
    @Transactional
    public void deleteArchetypeSets(Integer refExerciceId, Archetype archetype) {
        RefExercice refExercice = getOrThrow(refExerciceId);
        refExercice.getSets().removeIf(set -> set.getArchetype() == archetype);
        if (refExercice.getSets().isEmpty()) {
            refExerciceRepository.delete(refExercice);
        } else {
            refExerciceRepository.save(refExercice);
        }
    }

    private RefExercice getOrThrow(Integer refExerciceId) {
        return refExerciceRepository.findById(refExerciceId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Exercice de référence introuvable : " + refExerciceId));
    }

    /**
     * Nettoie le {@link Pageable} : borne la taille de page et ne conserve que les
     * tris sur des champs autorisés (sinon tri par défaut : type d'exercice, type de
     * semaine, objectif, numéro d'ordre).
     *
     * <p>Un {@link Pageable} non paginé (déclenché par {@code size=0} côté API) est
     * conservé tel quel — tous les résultats sont retournés — avec un tri assaini.</p>
     */
    private Pageable sanitizeSort(Pageable pageable) {
        Sort sanitized = Sort.by(pageable.getSort().stream()
                .filter(order -> SORTABLE_FIELDS.contains(order.getProperty()))
                .toList());
        if (sanitized.isUnsorted()) {
            sanitized = Sort.by(Sort.Direction.ASC, "exerciceType", "weekType", "goal", "trainingOrder");
        }
        if (pageable.isUnpaged()) {
            return Pageable.unpaged(sanitized);
        }
        int size = Math.clamp(pageable.getPageSize(), 1, MAX_PAGE_SIZE);
        return PageRequest.of(pageable.getPageNumber(), size, sanitized);
    }
}
