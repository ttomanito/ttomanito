package com.ssafy.ttomanito.domain.push.controller;

import com.ssafy.ttomanito.domain.push.dto.PushTokenRegisterRequest;
import com.ssafy.ttomanito.domain.push.service.PushTokenService;
import com.ssafy.ttomanito.global.security.userdetails.JwtUserDetails;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/push")
@RequiredArgsConstructor
@Tag(name = "푸쉬 알림", description = "푸쉬 알림 관련 API")
public class PushController {
    private final PushTokenService service;

    @Operation(
            summary = "푸시 토큰 등록/갱신",
            description = "현재 로그인한 사용자의 푸시 토큰을 저장합니다. 이미 존재하면 활성화합니다.",
            security = @SecurityRequirement(name = "bearer-key")
    )
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "등록/갱신 성공"),
            @ApiResponse(responseCode = "400", description = "잘못된 요청 바디"),
            @ApiResponse(responseCode = "401", description = "인증 실패"),
            @ApiResponse(responseCode = "500", description = "서버 오류")
    })
    @PostMapping("/token")
    public ResponseEntity<Void> register(
            @AuthenticationPrincipal @Parameter(hidden = true) JwtUserDetails user,
            @RequestBody PushTokenRegisterRequest req
    ) {
        service.saveToken(user.getUserId(), req.token());
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/token")
    @Operation(
            summary = "푸시 토큰 해제",
            description = "현재 로그인한 사용자의 해당 토큰만 비활성화합니다.",
            security = @SecurityRequirement(name = "bearer-key")
    )
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "해제 성공"),
            @ApiResponse(responseCode = "401", description = "인증 실패")
    })
    public ResponseEntity<Void> unregister(
            @AuthenticationPrincipal @Parameter(hidden = true) JwtUserDetails user,
            @RequestParam("token") String token
    ) {
        service.invalidateOwned(user.getUserId(), token); // ✅ 소유자 검증
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/tokens")
    @Operation(
            summary = "내 모든 기기의 푸시 토큰 해제",
            description = "현재 로그인한 사용자의 모든 활성 푸시 토큰을 비활성화합니다. (모든 기기 로그아웃 시 사용)",
            security = @SecurityRequirement(name = "bearer-key")
    )
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "해제 성공"),
            @ApiResponse(responseCode = "401", description = "인증 실패")
    })
    public ResponseEntity<Void> unregisterAll(
            @AuthenticationPrincipal @Parameter(hidden = true) JwtUserDetails user
    ) {
        service.invalidateAllOwned(user.getUserId());
        return ResponseEntity.noContent().build();
    }
}
