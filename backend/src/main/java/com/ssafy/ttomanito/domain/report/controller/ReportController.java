package com.ssafy.ttomanito.domain.report.controller;

import com.ssafy.ttomanito.domain.report.dto.ReportDetailResponseDto;
import com.ssafy.ttomanito.domain.report.service.ReportService;
import com.ssafy.ttomanito.global.security.userdetails.JwtUserDetails;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;

import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/report")
@RequiredArgsConstructor
@Tag(name = "최종 보고서", description = "최종 보고서 관련 API")
public class ReportController {
    private final ReportService reportService;

    @Operation(
            summary = "내 결과 보고서 히스토리 조회",
            description = "JWT 토큰의 사용자 ID 기준으로, 내가 완료한 결과 보고서 목록을 반환합니다."

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

    @Operation(
            summary = "특정 방 보고서 상세 조회",
            description = "roomId를 받아 해당 방의 보고서를 반환합니다. 종료된 방만 조회됩니다."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "성공"),
            @ApiResponse(responseCode = "404", description = "방이 없거나 종료되지 않음 / 유저 미참여")
    })
    @GetMapping("/reportdetail/{roomId}")
    public ResponseEntity<ReportDetailResponseDto> getReportDetail(
            @Parameter(description = "보고서 대상 roomId", required = true)
            @PathVariable("roomId") Long roomId,
            @AuthenticationPrincipal JwtUserDetails user // 프로젝트에 맞게 타입 사용
    ) {
        Long userId = user.getUserId();
        ReportDetailResponseDto dto = reportService.getReportDetail(userId, roomId);
        return ResponseEntity.ok(dto);
    }
}
