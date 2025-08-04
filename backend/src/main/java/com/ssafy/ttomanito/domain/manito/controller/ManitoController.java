package com.ssafy.ttomanito.domain.manito.controller;

import com.ssafy.ttomanito.domain.manito.dto.ManitoGuessHistoryDto;
import com.ssafy.ttomanito.domain.manito.dto.ManitoGuessRequestDto;
import com.ssafy.ttomanito.domain.manito.service.ManitoService;
import com.ssafy.ttomanito.global.security.userdetails.JwtUserDetails;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RequiredArgsConstructor
@RestController
@RequestMapping("/manito")
public class ManitoController {
    private final ManitoService manitoService;

    @Operation(summary = "마니띠 ID 조회", description = "현재 로그인한 사용자의 마니띠 ID를 조회합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "조회 성공"),
            @ApiResponse(responseCode = "404", description = "마니또 배정 정보 없음")
    })
    @GetMapping("/manitee")
    public ResponseEntity<Long> getManiteeId(@AuthenticationPrincipal JwtUserDetails principal) {
        Long maniteeId = manitoService.getManiteeId(principal.getUserId());
        return ResponseEntity.ok(maniteeId);
    }

    @Operation(summary = "마니또 추측 제출", description = "본인의 마니또를 추측하여 서버에 제출합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "추측 저장 완료"),
            @ApiResponse(responseCode = "400", description = "요청 형식 오류"),
            @ApiResponse(responseCode = "404", description = "방 정보 또는 마니또 배정 정보 없음")
    })
    @PostMapping("/guess")
    public ResponseEntity<Void> guessManito(
            @AuthenticationPrincipal JwtUserDetails principal,
            @RequestBody ManitoGuessRequestDto requestDto
    ) {
        manitoService.guessManito(principal.getUserId(), requestDto.guessedUserId());
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "마니또 추측 내역 조회", description = "본인의 마니또 추측 내역을 리스트로 반환합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "조회 성공"),
            @ApiResponse(responseCode = "404", description = "내역 없음")
    })
    @GetMapping("/guess/history")
    public ResponseEntity<List<ManitoGuessHistoryDto>> getGuessHistory(@AuthenticationPrincipal JwtUserDetails principal) {
        Long userId = principal.getUserId();
        List<ManitoGuessHistoryDto> result = manitoService.getGuessHistory(userId);
        return ResponseEntity.ok(result);
    }

    @Operation(summary = "마니또 게임 종료", description = "방장 권한으로 마니또 게임을 종료합니다. 종료일이 지나지 않았더라도 즉시 종료할 수 있습니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "종료 성공"),
            @ApiResponse(responseCode = "404", description = "방을 찾을 수 없음 또는 권한 없음")
    })
    @PostMapping("/finish")
    public ResponseEntity<Void> finishManito(
            @AuthenticationPrincipal JwtUserDetails principal
    ) {
        manitoService.finishRoom(principal.getUserId());
        return ResponseEntity.ok().build();
    }
}
