package com.example.backend.repositories;

import com.example.backend.dto.RefArchetypeResponse;
import com.example.backend.entities.RefArchetype;
import com.example.backend.enums.Archetype;
import com.example.backend.enums.Endurance;
import com.example.backend.enums.StrengthSpeed;
import com.example.backend.enums.Technique;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

/**
 * Accès aux données des archétypes de référence.
 * La liste paginée est projetée dans {@link RefArchetypeResponse} (projection DTO
 * par constructeur) avec quatre filtres optionnels.
 */
public interface RefArchetypeRepository extends JpaRepository<RefArchetype, Integer> {

    /**
     * Liste paginée, filtrable (archétype, force-vitesse, technique, endurance) et
     * triable côté serveur. Les filtres sont optionnels : {@code null} désactive le
     * filtre correspondant.
     */
    @Query("""
            SELECT
                r.refArchetypeId,
                r.archetype,
                r.strengthSpeed,
                r.technique,
                r.endurance
            FROM RefArchetype r
            WHERE (:archetype IS NULL OR r.archetype = :archetype)
              AND (:strengthSpeed IS NULL OR r.strengthSpeed = :strengthSpeed)
              AND (:technique IS NULL OR r.technique = :technique)
              AND (:endurance IS NULL OR r.endurance = :endurance)
            """)
    Page<RefArchetypeResponse> findAllFiltered(
            @Param("archetype") Archetype archetype,
            @Param("strengthSpeed") StrengthSpeed strengthSpeed,
            @Param("technique") Technique technique,
            @Param("endurance") Endurance endurance,
            Pageable pageable
    );

    /**
     * Indique si la combinaison de profils (force-vitesse, technique, endurance)
     * existe déjà — utilisé pour garantir l'unicité à la création.
     */
    boolean existsByStrengthSpeedAndTechniqueAndEndurance(
            StrengthSpeed strengthSpeed, Technique technique, Endurance endurance);

    /**
     * Variante excluant un identifiant donné — utilisée à la modification pour ne pas
     * détecter la ligne courante comme un doublon d'elle-même.
     */
    boolean existsByStrengthSpeedAndTechniqueAndEnduranceAndRefArchetypeIdNot(
            StrengthSpeed strengthSpeed, Technique technique, Endurance endurance, Integer refArchetypeId);
}
