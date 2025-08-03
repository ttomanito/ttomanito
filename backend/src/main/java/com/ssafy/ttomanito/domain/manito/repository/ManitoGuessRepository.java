package com.ssafy.ttomanito.domain.manito.repository;

import com.ssafy.ttomanito.domain.manito.entity.ManitoGuess;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ManitoGuessRepository extends JpaRepository<ManitoGuess, Long> {

    // 특정 유저의 추측 기록 가져오기
    List<ManitoGuess> findByGuessUserId(Long guessUserId);

    // 특정 날짜의 추측 확인 (중복 추측 방지 등에 활용 가능)
    List<ManitoGuess> findByGuessUserIdAndGuessedDate(Long guessUserId, java.time.LocalDate guessedDate);

    // 정답 여부 확인용 (optional)
    List<ManitoGuess> findByGuessUserIdAndGuessedUserId(Long guessUserId, Long guessedUserId);
}
