package com.example.backend.dto;

import org.springframework.data.domain.Page;

import java.util.List;

/**
 * Enveloppe de pagination générique renvoyée au frontend, découplée de l'API Spring Data.
 */
public record PageResponse<T>(
        List<T> content,
        int page,
        int size,
        long totalElements,
        int totalPages
) {
    public static <T> PageResponse<T> from(Page<T> page) {
        return new PageResponse<>(
                page.getContent(),
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages()
        );
    }
}
