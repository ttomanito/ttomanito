package com.ssafy.ttomanito.domain.rank.controller;

import com.ssafy.ttomanito.domain.rank.dto.RankingDto;
import com.ssafy.ttomanito.domain.rank.entity.RankingGenre;
import com.ssafy.ttomanito.domain.rank.service.RankingService;
import com.ssafy.ttomanito.global.security.userdetails.JwtUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/rank")
@RequiredArgsConstructor
public class RankingController {
    private final RankingService rankingService;

    @GetMapping("/{genreId}")
    public ResponseEntity<List<RankingDto>> getRankingById(
            @PathVariable int genreId,
            @AuthenticationPrincipal JwtUserDetails userDetails) {
        // int → enum 변환
        Long userId = userDetails.getUserId();
        List<RankingDto> result = rankingService.getRoomRanking(genreId, userId);
        return ResponseEntity.ok(result);
    }
}
