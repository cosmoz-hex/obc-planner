package com.example.backend.services.impl;

import com.example.backend.dto.PageResponse;
import com.example.backend.dto.RefArchetypeRequest;
import com.example.backend.dto.RefArchetypeResponse;
import com.example.backend.entities.RefArchetype;
import com.example.backend.enums.Archetype;
import com.example.backend.enums.Endurance;
import com.example.backend.enums.StrengthSpeed;
import com.example.backend.enums.Technique;
import com.example.backend.exception.BusinessRuleException;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.repositories.RefArchetypeRepository;
import com.example.backend.services.apis.RefArchetypeService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;

@Service
@RequiredArgsConstructor
public class RefArchetypeServiceImpl implements RefArchetypeService {

    /**
     * Propriétés autorisées pour le tri côté serveur (protection contre le tri arbitraire).
     */
    private static final Set<String> SORTABLE_FIELDS = Set.of("archetype", "strengthSpeed", "technique", "endurance");

    /**
     * Taille de page maximale autorisée (protection contre les requêtes trop larges).
     */
    private static final int MAX_PAGE_SIZE = 100;

    private final RefArchetypeRepository refArchetypeRepository;
    private final RefArchetypeMapper refArchetypeMapper;

    @Override
    @Transactional(readOnly = true)
    public PageResponse<RefArchetypeResponse> findAll(
            Archetype archetype,
            StrengthSpeed strengthSpeed,
            Technique technique,
            Endurance endurance,
            Pageable pageable
    ) {
        return PageResponse.from(refArchetypeRepository.findAllFiltered(archetype, strengthSpeed, technique, endurance, sanitizeSort(pageable)));
    }

    @Override
    @Transactional(readOnly = true)
    public RefArchetypeResponse findById(Integer refArchetypeId) {
        return refArchetypeMapper.toResponse(getOrThrow(refArchetypeId));
    }

    @Override
    @Transactional
    public RefArchetypeResponse create(RefArchetypeRequest request) {
        validateUniqueCombination(request, null);
        RefArchetype saved = refArchetypeRepository.save(refArchetypeMapper.toEntity(request));
        return refArchetypeMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public RefArchetypeResponse update(Integer refArchetypeId, RefArchetypeRequest request) {
        RefArchetype refArchetype = getOrThrow(refArchetypeId);
        validateUniqueCombination(request, refArchetypeId);
        refArchetypeMapper.updateEntity(refArchetype, request);
        return refArchetypeMapper.toResponse(refArchetypeRepository.save(refArchetype));
    }

    @Override
    @Transactional
    public void delete(Integer refArchetypeId) {
        RefArchetype refArchetype = getOrThrow(refArchetypeId);
        refArchetypeRepository.delete(refArchetype);
    }

    private RefArchetype getOrThrow(Integer refArchetypeId) {
        return refArchetypeRepository.findById(refArchetypeId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Archétype introuvable : " + refArchetypeId));
    }

    /**
     * Garantit l'unicité de la combinaison de profils (force-vitesse, technique,
     * endurance), indépendamment de l'archétype. En modification, la ligne courante
     * ({@code currentId}) est exclue de la détection de doublon.
     */
    private void validateUniqueCombination(RefArchetypeRequest request, Integer currentId) {
        boolean duplicate = (currentId == null)
                ? refArchetypeRepository.existsByStrengthSpeedAndTechniqueAndEndurance(
                request.strengthSpeed(), request.technique(), request.endurance())
                : refArchetypeRepository.existsByStrengthSpeedAndTechniqueAndEnduranceAndRefArchetypeIdNot(
                request.strengthSpeed(), request.technique(), request.endurance(), currentId);
        if (duplicate) {
            throw new BusinessRuleException("Cette combinaison de profils est déjà associée à un archétype.");
        }
    }

    /**
     * Nettoie le {@link Pageable} : borne la taille de page et ne conserve que les
     * tris sur des champs autorisés (sinon tri par défaut par archétype).
     *
     * <p>Un {@link Pageable} non paginé (déclenché par {@code size=0} côté API) est
     * conservé tel quel — tous les résultats sont retournés — avec un tri assaini.</p>
     */
    private Pageable sanitizeSort(Pageable pageable) {
        Sort sanitized = Sort.by(pageable.getSort().stream()
                .filter(order -> SORTABLE_FIELDS.contains(order.getProperty()))
                .toList());
        if (sanitized.isUnsorted()) {
            sanitized = Sort.by(Sort.Direction.ASC, "archetype", "strengthSpeed", "technique", "endurance");
        }
        if (pageable.isUnpaged()) {
            return Pageable.unpaged(sanitized);
        }
        int size = Math.clamp(pageable.getPageSize(), 1, MAX_PAGE_SIZE);
        return PageRequest.of(pageable.getPageNumber(), size, sanitized);
    }
}
