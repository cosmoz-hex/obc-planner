package com.example.backend.repositories;

import com.example.backend.entities.EvalDetail;
import org.springframework.data.jpa.repository.JpaRepository;

/** Accès aux lignes de détail d'évaluation ({@code eval_details}). */
public interface EvalDetailRepository extends JpaRepository<EvalDetail, Integer> {
}
