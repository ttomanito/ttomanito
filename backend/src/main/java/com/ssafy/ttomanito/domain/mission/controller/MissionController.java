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
@Tag(name = "Mission", description = "미션 관련 API")
public class MissionController {

    private final MissionService missionService;

    //오늘의 미션 받기(미션 날이 아니면 아무것도 x)
    @Operation(
            summary = "오늘의 미션 조회",
            description = """
        오늘 수행할 미션을 조회하거나 새로 발급받습니다.  
        이미 받은 미션이 있으면 해당 미션과 상태 정보를 반환하며, 없으면 새로 생성합니다.  
        ✅ 응답에는 해당 미션 상태 ID (`missionStatusId`)가 포함되어, 추후 완료 처리 시 사용됩니다.
    """
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "조회 또는 생성 성공"),
            @ApiResponse(responseCode = "404", description = "진행 중인 마니또 방 없음"),
            @ApiResponse(responseCode = "500", description = "줄 수 있는 새로운 미션 없음")
    })

    @GetMapping
    public MissionResponseDto getTodayMission(@AuthenticationPrincipal JwtUserDetails principal) {
        return missionService.getTodayMission(principal.getUserId());
    }
    //현재 참여 중인 방에서 받은 미션 리스트 조회
    @Operation(
            summary = "나의 미션 리스트 조회",
            description = """
        현재 방에서 받은 모든 미션 내역을 조회합니다.  
        각 미션에는 해당하는 `missionStatusId`가 함께 포함되며, 완료 여부도 함께 반환됩니다.
    """
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "조회 성공"),
            @ApiResponse(responseCode = "404", description = "진행 중인 마니또 방 없음")
    })

    @GetMapping("/missionlist")
    public List<MissionListItemDto> getMyMissionList(@AuthenticationPrincipal JwtUserDetails principal) {
        System.out.println(">> Principal: " + principal);

        return missionService.getMyMissionList(principal.getUserId());
    }

    @Operation(
            summary = "미션 완료 처리",
            description = """
        지정된 미션 상태 ID (`missionStatusId`)에 대해 완료 처리를 수행합니다.  
        이 ID는 오늘의 미션 조회 또는 리스트 응답에서 전달받은 값을 사용해야 합니다.
    """
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "완료 성공"),
            @ApiResponse(responseCode = "400", description = "유효하지 않은 요청"),
            @ApiResponse(responseCode = "404", description = "해당 미션 상태 없음 또는 본인의 미션 아님")
    })

    @PatchMapping("/{missionStatusId}/success")
    public ResponseEntity<Void> completeMission(
            @AuthenticationPrincipal JwtUserDetails principal,
            @PathVariable Long missionStatusId) {
        missionService.completeMission(principal.getUserId(), missionStatusId);
        return ResponseEntity.ok().build();
    }
}
