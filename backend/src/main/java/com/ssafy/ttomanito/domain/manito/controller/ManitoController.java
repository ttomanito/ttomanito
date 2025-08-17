package com.ssafy.ttomanito.domain.manito.controller;

import com.ssafy.ttomanito.domain.manito.dto.ManitoGuessHistoryDto;
import com.ssafy.ttomanito.domain.manito.dto.ManitoGuessRequestDto;
import com.ssafy.ttomanito.domain.manito.service.ManitoService;
import com.ssafy.ttomanito.global.security.userdetails.JwtUserDetails;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/manito")
@RequiredArgsConstructor
@Tag(name = "마니또", description = "마니또 관련 API")
public class ManitoController {
    private final ManitoService manitoService;

    @Operation(summary = "마니띠 ID 조회", description = "현재 로그인한 사용자의 마니띠 ID를 조회합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "조회 성공"),
            @ApiResponse(responseCode = "404", description = "참여 중인 방이 없거나 마니띠 배정 정보 없음")
    })
    @GetMapping("/manitee")
    public ResponseEntity<Long> getManiteeId(@AuthenticationPrincipal JwtUserDetails user) {
        Long maniteeId = manitoService.getManiteeId(user.getUserId());
        return ResponseEntity.ok(maniteeId);
    }

    @Operation(summary = "마니또 추측 제출", description = "본인의 마니또를 추측하여 서버에 제출합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "추측 저장 완료"),
            @ApiResponse(responseCode = "400", description = "참여 중인 방이 없거나 이미 종료된 방이거나 잘못된 요청"),
            @ApiResponse(responseCode = "404", description = "마니또 배정 정보 없음")
    })
    @PostMapping("/guess")
    public ResponseEntity<Boolean> guessManito(
            @AuthenticationPrincipal JwtUserDetails user,
            @RequestBody ManitoGuessRequestDto requestDto
    ) {
        boolean correct = manitoService.guessManito(user.getUserId(), requestDto.guessedUserId());
        return ResponseEntity.ok(correct);
    }

    @Operation(summary = "마니또 추측 내역 조회", description = "본인의 마니또 추측 내역을 리스트로 반환합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "조회 성공")
    })
    @GetMapping("/guess/history")
    public ResponseEntity<List<ManitoGuessHistoryDto>> getGuessHistory(
            @AuthenticationPrincipal JwtUserDetails user
    ) {
        List<ManitoGuessHistoryDto> result = manitoService.getGuessHistory(user.getUserId());
        return ResponseEntity.ok(result);
    }

    @Operation(summary = "마니또 게임 종료", description = "방장 권한으로 마니또 게임을 종료합니다. 종료일과 관계없이 즉시 종료할 수 있습니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "종료 성공"),
            @ApiResponse(responseCode = "400", description = "참여 중인 방이 없거나 이미 종료된 방"),
            @ApiResponse(responseCode = "404", description = "해당 방을 찾을 수 없거나 권한 없음")
    })
    @PostMapping("/finish")
    public ResponseEntity<Void> finishManito(
            @AuthenticationPrincipal JwtUserDetails user
    ) {
        manitoService.finishRoom(user.getUserId());
        return ResponseEntity.ok().build();
    }
}
