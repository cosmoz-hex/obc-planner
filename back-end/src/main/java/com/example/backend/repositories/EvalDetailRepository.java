package com.example.backend.repositories;

import com.example.backend.entities.EvalDetail;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

/** Accès aux lignes de détail d'évaluation ({@code eval_details}). */
public interface EvalDetailRepository extends JpaRepository<EvalDetail, Integer> {

    /** Lignes de détail d'une évaluation, dans l'ordre de leur identifiant. */
    List<EvalDetail> findByEvaluation_EvaluationIdOrderByEvaluationDetailIdAsc(Integer evaluationId);

    /** Supprime toutes les lignes de détail d'une évaluation (remplacement en édition). */
    void deleteByEvaluation_EvaluationId(Integer evaluationId);
}
