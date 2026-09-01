package com.example.backend.services.impl;

import com.example.backend.dto.AthleteRequest;
import com.example.backend.dto.AthleteResponse;
import com.example.backend.dto.PageResponse;
import com.example.backend.entities.Athlete;
import com.example.backend.enums.AgeCategorie;
import com.example.backend.enums.Sexe;
import com.example.backend.enums.WeightCategorie;
import com.example.backend.exception.BusinessRuleException;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.repositories.AthleteRepository;
import com.example.backend.services.apis.AthleteService;
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
public class AthleteServiceImpl implements AthleteService {

    /** Propriétés autorisées pour le tri côté serveur (protection contre le tri arbitraire). */
    private static final Set<String> SORTABLE_FIELDS =
            Set.of("firstName", "lastName", "sexe", "ageCategorie", "weightCategorie", "compLevel");

    /** Taille de page maximale autorisée (protection contre les requêtes trop larges). */
    private static final int MAX_PAGE_SIZE = 100;

    private final AthleteRepository athleteRepository;
    private final AthleteMapper athleteMapper;

    @Override
    @Transactional(readOnly = true)
    public PageResponse<AthleteResponse> findAll(Sexe sexe, AgeCategorie ageCategorie, Pageable pageable) {
        Page<AthleteResponse> page = athleteRepository.findAllFiltered(sexe, ageCategorie, sanitizeSort(pageable));
        return PageResponse.from(page);
    }

    @Override
    @Transactional(readOnly = true)
    public AthleteResponse findById(Integer athleteId) {
        return athleteMapper.toResponse(getOrThrow(athleteId));
    }

    @Override
    @Transactional
    public AthleteResponse create(AthleteRequest request) {
        validateWeightForSexe(request);
        Athlete saved = athleteRepository.save(athleteMapper.toEntity(request));
        return athleteMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public AthleteResponse update(Integer athleteId, AthleteRequest request) {
        validateWeightForSexe(request);
        Athlete athlete = getOrThrow(athleteId);
        athleteMapper.updateEntity(athlete, request);
        return athleteMapper.toResponse(athleteRepository.save(athlete));
    }

    @Override
    @Transactional
    public void delete(Integer athleteId) {
        // La suppression des évaluations/programmes liés est propagée par la base
        // (contraintes FK ON DELETE CASCADE).
        Athlete athlete = getOrThrow(athleteId);
        athleteRepository.delete(athlete);
    }

    private Athlete getOrThrow(Integer athleteId) {
        return athleteRepository.findById(athleteId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Athlète introuvable : " + athleteId));
    }

    /** Vérifie que la catégorie de poids est valide pour le sexe fourni. */
    private void validateWeightForSexe(AthleteRequest request) {
        boolean valid = WeightCategorie.of(request.weightCategorie(), request.sexe()).isPresent();
        if (!valid) {
            throw new BusinessRuleException(
                    "Catégorie de poids invalide pour le sexe sélectionné.");
        }
    }

    /**
     * Nettoie le {@link Pageable} : borne la taille de page et ne conserve que les
     * tris sur des champs autorisés (sinon tri par défaut par nom).
     */
    private Pageable sanitizeSort(Pageable pageable) {
        Sort sanitized = Sort.by(pageable.getSort().stream()
                .filter(order -> SORTABLE_FIELDS.contains(order.getProperty()))
                .toList());
        if (sanitized.isUnsorted()) {
            sanitized = Sort.by(Sort.Direction.ASC, "lastName", "firstName");
        }
        int size = Math.clamp(pageable.getPageSize(), 1, MAX_PAGE_SIZE);
        return PageRequest.of(pageable.getPageNumber(), size, sanitized);
    }
}
