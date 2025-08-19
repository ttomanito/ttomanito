package com.ssafy.ttomanito.domain.manito.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.ZoneId;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "manito_guess")
public class ManitoGuess {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "manito_guess_id")
    private Long manitoGuessId;

    @Column(name = "guess_user_id", nullable = false)
    private Long guessUserId;

    @Column(name = "guessed_user_id", nullable = false)
    private Long guessedUserId;

    @Column(name = "guessed_date", nullable = false)
    private LocalDate guessedDate;

    @Column(name = "is_correct")
    private Boolean isCorrect;

    @Builder
    private ManitoGuess(Long guessUserId, Long guessedUserId, LocalDate guessedDate, Boolean isCorrect) {
        this.guessUserId = guessUserId;
        this.guessedUserId = guessedUserId;
        this.guessedDate = guessedDate;
        this.isCorrect = isCorrect;
    }

    public static ManitoGuess create(Long guessUserId, Long guessedUserId, Boolean isCorrect) {
        return ManitoGuess.builder()
                .guessUserId(guessUserId)
                .guessedUserId(guessedUserId)
                .guessedDate(LocalDate.now(ZoneId.of("Asia/Seoul")))
                .isCorrect(isCorrect)
                .build();
    }

    public void markCorrect() {
        this.isCorrect = true;
    }

    public void markIncorrect() {
        this.isCorrect = false;
    }
}
