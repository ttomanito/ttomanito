package com.ssafy.ttomanito.domain.mission.controller;


import com.ssafy.ttomanito.domain.mission.dto.MissionResponseDto;
import com.ssafy.ttomanito.domain.mission.service.MissionService;
import com.ssafy.ttomanito.global.security.userdetails.JwtUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/manito/mission")
@RequiredArgsConstructor
public class MissionController {

    private final MissionService missionService;

    @GetMapping
    public MissionResponseDto getTodayMission(@AuthenticationPrincipal JwtUserDetails principal) {
        return missionService.getTodayMission(principal.getUserId());
    }
}
