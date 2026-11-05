package com.example.backend.services.impl;

import com.example.backend.dto.PageResponse;
import com.example.backend.dto.RefPlanningRequest;
import com.example.backend.dto.RefPlanningResponse;
import com.example.backend.entities.RefPlanning;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.repositories.RefPlanningRepository;
import com.example.backend.services.apis.RefPlanningService;
import com.example.backend.services.mapper.RefPlanningMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;

@Service
@RequiredArgsConstructor
public class RefPlanningServiceImpl implements RefPlanningService {

    /**
     * Propriétés autorisées pour le tri côté serveur (protection contre le tri arbitraire).
     */
    private static final Set<String> SORTABLE_FIELDS =
            Set.of("weeksNumbers", "trainingOrder", "exerciceOrder", "exerciceType");

    /**
     * Taille de page maximale autorisée (protection contre les requêtes trop larges).
     */
    private static final int MAX_PAGE_SIZE = 100;

    private final RefPlanningRepository refPlanningRepository;
    private final RefPlanningMapper refPlanningMapper;

    @Override
    @Transactional(readOnly = true)
    public PageResponse<RefPlanningResponse> findAll(Integer weeksNumbers, Integer trainingOrder, Pageable pageable) {
        return PageResponse.from(refPlanningRepository.findAllFiltered(weeksNumbers, trainingOrder, sanitizeSort(pageable)));
    }

    @Override
    @Transactional(readOnly = true)
    public RefPlanningResponse findById(Integer refPlanningId) {
        return refPlanningMapper.toResponse(getOrThrow(refPlanningId));
    }

    @Override
    @Transactional
    public RefPlanningResponse create(RefPlanningRequest request) {
        RefPlanning saved = refPlanningRepository.save(refPlanningMapper.toEntity(request));
        return refPlanningMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public RefPlanningResponse update(Integer refPlanningId, RefPlanningRequest request) {
        RefPlanning refPlanning = getOrThrow(refPlanningId);
        refPlanningMapper.updateEntity(refPlanning, request);
        return refPlanningMapper.toResponse(refPlanningRepository.save(refPlanning));
    }

    @Override
    @Transactional
    public void delete(Integer refPlanningId) {
        RefPlanning refPlanning = getOrThrow(refPlanningId);
        refPlanningRepository.delete(refPlanning);
    }

    private RefPlanning getOrThrow(Integer refPlanningId) {
        return refPlanningRepository.findById(refPlanningId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Ligne de planning introuvable : " + refPlanningId));
    }

    /**
     * Nettoie le {@link Pageable} : borne la taille de page et ne conserve que les
     * tris sur des champs autorisés (sinon tri par défaut : format hebdomadaire,
     * puis numéro de séance, puis numéro d'exercice).
     *
     * <p>Un {@link Pageable} non paginé (déclenché par {@code size=0} côté API) est
     * conservé tel quel — tous les résultats sont retournés — avec un tri assaini.</p>
     */
    private Pageable sanitizeSort(Pageable pageable) {
        Sort sanitized = Sort.by(pageable.getSort().stream()
                .filter(order -> SORTABLE_FIELDS.contains(order.getProperty()))
                .toList());
        if (sanitized.isUnsorted()) {
            sanitized = Sort.by(Sort.Direction.ASC, "weeksNumbers", "trainingOrder", "exerciceOrder");
        }
        if (pageable.isUnpaged()) {
            return Pageable.unpaged(sanitized);
        }
        int size = Math.clamp(pageable.getPageSize(), 1, MAX_PAGE_SIZE);
        return PageRequest.of(pageable.getPageNumber(), size, sanitized);
    }
}
