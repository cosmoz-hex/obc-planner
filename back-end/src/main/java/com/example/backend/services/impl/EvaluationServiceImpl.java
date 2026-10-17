package com.example.backend.services.impl;

import com.example.backend.dto.EvaluationCreatedResponse;
import com.example.backend.dto.EvaluationRequest;
import com.example.backend.dto.EvaluationResponse;
import com.example.backend.dto.PageResponse;
import com.example.backend.entities.Athlete;
import com.example.backend.entities.EvalDetail;
import com.example.backend.entities.EvalSummary;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.repositories.AthleteRepository;
import com.example.backend.repositories.EvalDetailRepository;
import com.example.backend.repositories.EvaluationRepository;
import com.example.backend.services.apis.EvaluationService;
import com.example.backend.services.mapper.EvaluationMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class EvaluationServiceImpl implements EvaluationService {

    /**
     * Propriétés de tri autorisées côté serveur (protection contre le tri
     * arbitraire), mappées vers leur chemin JPQL. Les colonnes de l'athlète
     * vivent sur la relation jointe {@code athlete}.
     */
    private static final Map<String, String> SORTABLE_FIELDS = Map.of(
            "evaluationDate", "evaluationDate",
            "firstName", "athlete.firstName",
            "lastName", "athlete.lastName",
            "archetype", "archetype",
            "strengthSpeed", "strengthSpeed",
            "technique", "technique",
            "endurance", "endurance"
    );

    /** Taille de page maximale autorisée (protection contre les requêtes trop larges). */
    private static final int MAX_PAGE_SIZE = 100;

    private final EvaluationRepository evaluationRepository;
    private final EvalDetailRepository evalDetailRepository;
    private final AthleteRepository athleteRepository;
    private final EvaluationMapper evaluationMapper;

    @Override
    @Transactional(readOnly = true)
    public PageResponse<EvaluationResponse> findAll(Pageable pageable) {
        Page<EvaluationResponse> page = evaluationRepository.findAllProjected(sanitizeSort(pageable));
        return PageResponse.from(page);
    }

    @Override
    @Transactional
    public EvaluationCreatedResponse create(EvaluationRequest request) {
        Athlete athlete = athleteRepository.findById(request.athleteId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Athlète introuvable : " + request.athleteId()));

        EvalSummary summary = evaluationRepository.save(evaluationMapper.toSummary(request, athlete));

        if (request.details() != null && !request.details().isEmpty()) {
            List<EvalDetail> details = request.details().stream()
                    .map(detail -> evaluationMapper.toDetail(detail, summary))
                    .toList();
            evalDetailRepository.saveAll(details);
        }

        return new EvaluationCreatedResponse(summary.getEvaluationId());
    }

    @Override
    @Transactional
    public void delete(Integer evaluationId) {
        if (!evaluationRepository.existsById(evaluationId)) {
            throw new ResourceNotFoundException("Évaluation introuvable : " + evaluationId);
        }
        // Les lignes eval_details associées sont supprimées en cascade (FK ON DELETE CASCADE).
        evaluationRepository.deleteById(evaluationId);
    }

    /**
     * Nettoie le {@link Pageable} : borne la taille de page et ne conserve que
     * les tris sur des champs autorisés (traduits vers leur chemin JPQL), avec
     * un tri par défaut par date d'évaluation décroissante.
     *
     * <p>Un {@link Pageable} non paginé (déclenché par {@code size=0} côté API)
     * est conservé tel quel — tous les résultats sont retournés — avec un tri
     * assaini.</p>
     */
    private Pageable sanitizeSort(Pageable pageable) {
        Sort sanitized = Sort.by(pageable.getSort().stream()
                .filter(order -> SORTABLE_FIELDS.containsKey(order.getProperty()))
                .map(order -> order.withProperty(SORTABLE_FIELDS.get(order.getProperty())))
                .toList());
        if (sanitized.isUnsorted()) {
            sanitized = Sort.by(Sort.Direction.DESC, "evaluationDate");
        }
        if (pageable.isUnpaged()) {
            return Pageable.unpaged(sanitized);
        }
        int size = Math.clamp(pageable.getPageSize(), 1, MAX_PAGE_SIZE);
        return PageRequest.of(pageable.getPageNumber(), size, sanitized);
    }
}
