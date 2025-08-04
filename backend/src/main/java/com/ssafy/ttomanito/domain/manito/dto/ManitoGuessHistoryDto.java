package com.ssafy.ttomanito.domain.manito.dto;

import com.ssafy.ttomanito.domain.manito.entity.ManitoGuess;

import java.time.LocalDate;

public record ManitoGuessHistoryDto(
        Long guessedUserId,
        LocalDate guessedDate,
        boolean isCorrect
) {
    public static ManitoGuessHistoryDto from(ManitoGuess entity) {
        return new ManitoGuessHistoryDto(
                entity.getGuessedUserId(),
                entity.getGuessedDate(),
                entity.getIsCorrect()
        );
    }
}