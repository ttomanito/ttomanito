package com.ssafy.ttomanito.domain.mission.controller;

import com.ssafy.ttomanito.domain.mission.dto.MissionListItemDto;
import com.ssafy.ttomanito.domain.mission.dto.MissionResponseDto;
import com.ssafy.ttomanito.domain.mission.service.MissionService;
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
@RequestMapping("/manito/mission")
@RequiredArgsConstructor
@Tag(name = "미션", description = "미션 관련 API")
public class MissionController {

    private final MissionService missionService;

    @Operation(
            summary = "오늘의 미션 조회",
            description = "오늘 수행할 미션을 조회하거나, 없으면 새로 발급합니다."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "미션 조회/생성 성공"),
            @ApiResponse(responseCode = "404", description = "진행 중인 방이 없습니다"),
            @ApiResponse(responseCode = "400", description = "새 미션이 없습니다")
    })
    @GetMapping
    public ResponseEntity<MissionResponseDto> getTodayMission(
            @AuthenticationPrincipal JwtUserDetails user
    ) {
        MissionResponseDto dto = missionService.getTodayMission(user.getUserId());
        return ResponseEntity.ok(dto);
    }

    @Operation(
            summary = "내 미션 목록 조회",
            description = "현재 방에서 받은 모든 미션과 완료 상태를 반환합니다."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "목록 조회 성공"),
            @ApiResponse(responseCode = "404", description = "진행 중인 방이 없습니다")
    })
    @GetMapping("/missionlist")
    public ResponseEntity<List<MissionListItemDto>> getMyMissionList(
            @AuthenticationPrincipal JwtUserDetails user
    ) {
        List<MissionListItemDto> list = missionService.getMyMissionList(user.getUserId());
        return ResponseEntity.ok(list);
    }

    @Operation(
            summary = "미션 완료 처리",
            description = "missionStatusId에 해당하는 미션을 완료 처리합니다."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "완료 처리 성공"),
            @ApiResponse(responseCode = "400", description = "잘못된 요청"),
            @ApiResponse(responseCode = "404", description = "미션 상태를 찾을 수 없습니다")
    })
    @PatchMapping("/{missionStatusId}/success")
    public ResponseEntity<Void> completeMission(
            @AuthenticationPrincipal JwtUserDetails user,
            @PathVariable Long missionStatusId
    ) {
        missionService.completeMission(user.getUserId(), missionStatusId);
        return ResponseEntity.ok().build();
    }
}
