package com.example.backend.services.impl;

import com.example.backend.dto.AthleteRequest;
import com.example.backend.dto.AthleteResponse;
import com.example.backend.entities.Athlete;
import org.springframework.stereotype.Component;

/** Conversions entre l'entité {@link Athlete} et ses DTOs. */
@Component
public class AthleteMapper {

    public Athlete toEntity(AthleteRequest request) {
        return Athlete.builder()
                .firstName(request.firstName())
                .lastName(request.lastName())
                .sexe(request.sexe())
                .ageCategorie(request.ageCategorie())
                .weightCategorie(request.weightCategorie())
                .compLevel(request.compLevel())
                .build();
    }

    public void updateEntity(Athlete athlete, AthleteRequest request) {
        athlete.setFirstName(request.firstName());
        athlete.setLastName(request.lastName());
        athlete.setSexe(request.sexe());
        athlete.setAgeCategorie(request.ageCategorie());
        athlete.setWeightCategorie(request.weightCategorie());
        athlete.setCompLevel(request.compLevel());
    }

    /** {@code lastEvaluationDate} n'est pas connu depuis l'entité seule : renvoyé à null. */
    public AthleteResponse toResponse(Athlete athlete) {
        return new AthleteResponse(
                athlete.getAthleteId(),
                athlete.getFirstName(),
                athlete.getLastName(),
                athlete.getSexe(),
                athlete.getAgeCategorie(),
                athlete.getWeightCategorie(),
                athlete.getCompLevel(),
                null
        );
    }
}
