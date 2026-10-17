package com.example.backend.services.impl;

import com.example.backend.dto.ExerciceRequest;
import com.example.backend.dto.ExerciceResponse;
import com.example.backend.dto.PageResponse;
import com.example.backend.entities.Exercice;
import com.example.backend.enums.CategorieExercice;
import com.example.backend.enums.TypeExercice;
import com.example.backend.exception.BusinessRuleException;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.repositories.ExerciceRepository;
import com.example.backend.services.apis.ExerciceService;
import com.example.backend.services.mapper.ExerciceMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;

/**
 * Implémentation du service des exercices de référence.
 */
@Service
@RequiredArgsConstructor
public class ExerciceServiceImpl implements ExerciceService {

    /** Propriétés autorisées pour le tri côté serveur (protection contre le tri arbitraire). */
    private static final Set<String> SORTABLE_FIELDS = Set.of("typeExercice", "categorieExercice", "exerciceCode", "estimateValue");

    /** Taille de page maximale autorisée. */
    private static final int MAX_PAGE_SIZE = 100;

    private final ExerciceRepository exerciceRepository;
    private final ExerciceMapper exerciceMapper;

    @Override
    @Transactional(readOnly = true)
    public PageResponse<ExerciceResponse> findAll(TypeExercice typeExercice, CategorieExercice categorieExercice, Pageable pageable) {
        return PageResponse.from(exerciceRepository.findAllFiltered(typeExercice, categorieExercice, sanitizeSort(pageable)));
    }

    @Override
    @Transactional(readOnly = true)
    public ExerciceResponse findById(Integer exerciceId) {
        return exerciceMapper.toResponse(getOrThrow(exerciceId));
    }

    @Override
    @Transactional
    public ExerciceResponse create(ExerciceRequest request) {
        validateUniqueCode(request.exerciceCode(), null);
        Exercice reference = resolveReference(request.exerciceRef());
        Exercice saved = exerciceRepository.save(exerciceMapper.toEntity(request, reference));
        return exerciceMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public ExerciceResponse update(Integer exerciceId, ExerciceRequest request) {
        Exercice exercice = getOrThrow(exerciceId);
        validateUniqueCode(request.exerciceCode(), exerciceId);
        Exercice reference = resolveReference(request.exerciceRef());
        exerciceMapper.updateEntity(exercice, request, reference);
        return exerciceMapper.toResponse(exerciceRepository.save(exercice));
    }

    @Override
    @Transactional
    public void delete(Integer exerciceId) {
        exerciceRepository.delete(getOrThrow(exerciceId));
    }

    private Exercice getOrThrow(Integer exerciceId) {
        return exerciceRepository.findById(exerciceId)
                .orElseThrow(() -> new ResourceNotFoundException("Exercice introuvable : " + exerciceId));
    }

    /**
     * Résout l'exercice de référence à partir de son identifiant (optionnel). Un
     * identifiant inconnu est signalé comme règle métier invalide.
     */
    private Exercice resolveReference(Integer exerciceRef) {
        if (exerciceRef == null) {
            return null;
        }
        return exerciceRepository.findById(exerciceRef)
                .orElseThrow(() -> new BusinessRuleException("Exercice de référence introuvable : " + exerciceRef));
    }

    /** Garantit l'unicité du code d'exercice. En modification, exclut la ligne courante. */
    private void validateUniqueCode(String exerciceCode, Integer currentId) {
        boolean duplicate = (currentId == null)
                ? exerciceRepository.existsByExerciceCode(exerciceCode)
                : exerciceRepository.existsByExerciceCodeAndExerciceIdNot(exerciceCode, currentId);
        if (duplicate) {
            throw new BusinessRuleException("Ce code d'exercice est déjà utilisé.");
        }
    }

    /**
     * Nettoie le {@link Pageable} : borne la taille de page et ne conserve que les
     * tris sur des champs autorisés (sinon tri par défaut type / catégorie / code).
     */
    private Pageable sanitizeSort(Pageable pageable) {
        Sort sanitized = Sort.by(pageable.getSort().stream()
                .filter(order -> SORTABLE_FIELDS.contains(order.getProperty()))
                .toList());
        if (sanitized.isUnsorted()) {
            sanitized = Sort.by(Sort.Direction.ASC, "typeExercice", "categorieExercice", "exerciceCode");
        }
        if (pageable.isUnpaged()) {
            return Pageable.unpaged(sanitized);
        }
        int size = Math.clamp(pageable.getPageSize(), 1, MAX_PAGE_SIZE);
        return PageRequest.of(pageable.getPageNumber(), size, sanitized);
    }
}
