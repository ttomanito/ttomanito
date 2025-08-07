package com.ssafy.ttomanito.domain.rank.controller;

import com.ssafy.ttomanito.domain.rank.dto.RankingDto;
import com.ssafy.ttomanito.domain.rank.entity.RankingGenre;
import com.ssafy.ttomanito.domain.rank.service.RankingService;
import com.ssafy.ttomanito.global.security.userdetails.JwtUserDetails;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
@Tag(
        name = "중간랭킹",
        description = "사용자 또는 방의 장르별 랭킹 조회 API, 매일 자정 자동 업데이트"
)
@RestController
@RequestMapping("/rank")
@RequiredArgsConstructor
public class RankingController {
    private final RankingService rankingService;
    @Operation(
            summary = "장르별 방 랭킹 조회",
            description = "장르 코드를 기반으로 해당 방의 랭킹 리스트를 반환합니다.\n" +
                    "장르 코드: 1(음성통화 시간), 2(채팅 보낸 횟수), 3(미션 수행 횟수)"
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "랭킹 리스트 조회 성공"),
            @ApiResponse(responseCode = "400", description = "잘못된 genreId 입력"),
            @ApiResponse(responseCode = "401", description = "인증 실패"),
            @ApiResponse(responseCode = "404", description = "해당 장르에 대한 랭킹을 찾을 수 없음")
    })
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
