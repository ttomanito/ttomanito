package com.ssafy.ttomanito.domain.manito.dto;

import java.time.LocalDate;

public record ManitoGuessResponseDto(
        Long guessId,
        Long guessUserId,
        Long guessedUserId,
        LocalDate guessedDate,
        boolean isCorrect

) {
}
