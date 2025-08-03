package com.ssafy.ttomanito.domain.mission.controller;


import com.ssafy.ttomanito.domain.mission.dto.MissionListItemDto;
import com.ssafy.ttomanito.domain.mission.dto.MissionResponseDto;
import com.ssafy.ttomanito.domain.mission.service.MissionService;
import com.ssafy.ttomanito.global.security.userdetails.JwtUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/manito/mission")
@RequiredArgsConstructor
public class MissionController {

    private final MissionService missionService;

    //오늘의 미션 받기(미션 날이 아니면 아무것도 x)
    @GetMapping
    public MissionResponseDto getTodayMission(@AuthenticationPrincipal JwtUserDetails principal) {
        return missionService.getTodayMission(principal.getUserId());
    }
    //현재 참여 중인 방에서 받은 미션 리스트 조회
    @GetMapping("/missionlist")
    public List<MissionListItemDto> getMyMissionList(@AuthenticationPrincipal JwtUserDetails principal) {
        System.out.println(">> Principal: " + principal);

        return missionService.getMyMissionList(principal.getUserId());
    }
    @PatchMapping("/{missionId}/success")
    public ResponseEntity<Void> completeMission(
            @AuthenticationPrincipal JwtUserDetails principal,
            @PathVariable Long missionId) {
        missionService.completeMission(principal.getUserId(), missionId);
        return ResponseEntity.ok().build();
    }
}
