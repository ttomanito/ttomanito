package com.ssafy.ttomanito.domain.report.controller;

import com.ssafy.ttomanito.domain.report.dto.ReportDetailResponseDto;
import com.ssafy.ttomanito.domain.report.service.ReportService;
import com.ssafy.ttomanito.global.security.userdetails.JwtUserDetails;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/report")
@RequiredArgsConstructor
public class ReportController {
    private final ReportService reportService;

    @Operation(
            summary = "내 결과 보고서 히스토리 조회",
            description = "JWT 토큰의 사용자 ID 기준으로, 내가 완료한 결과 보고서 목록을 반환합니다.",
            operationId = "getMyReportHistory",
            security = {@SecurityRequirement(name = "bearerAuth")}
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "조회 성공",
                    content = @Content(array = @ArraySchema(
                            schema = @Schema(implementation = ReportDetailResponseDto.class)
                    ))
            ),
            @ApiResponse(responseCode = "401", description = "인증 실패(유효하지 않은 토큰)"),
            @ApiResponse(responseCode = "403", description = "인가 실패(권한 없음)"),
            @ApiResponse(responseCode = "500", description = "서버 에러")
    })
    @GetMapping("/history")
    public ResponseEntity<List<ReportDetailResponseDto>> getMyReportHistory(
            @AuthenticationPrincipal JwtUserDetails user
    ) {
        return ResponseEntity.ok(
                reportService.getFinishedReportHistory(user.getUserId())
        );
    }
}
