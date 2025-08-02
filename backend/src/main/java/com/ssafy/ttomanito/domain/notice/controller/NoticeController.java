package com.ssafy.ttomanito.domain.notice.controller;

import com.ssafy.ttomanito.domain.notice.dto.NoticeResponse;
import com.ssafy.ttomanito.domain.notice.service.NoticeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import com.ssafy.ttomanito.global.security.userdetails.JwtUserDetails;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@Tag(name = "알림 API", description = "알림 관련 API입니다.")
@RestController
@RequiredArgsConstructor
@RequestMapping("/notice")
public class NoticeController {

    private final NoticeService noticeService;


    @Operation(
            summary = "알림 목록 조회", description = "로그인한 사용자의 알림 목록을 조회합니다."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "알림 목록 조회 성공"),
            @ApiResponse(responseCode = "401", description = "인증 실패 (JWT 토큰 만료 또는 누락)"),
            @ApiResponse(responseCode = "500", description = "서버 오류")
    })
    @GetMapping
    public List<NoticeResponse> getNoticeList(
            @Parameter(hidden = true) HttpServletRequest request,
            @AuthenticationPrincipal JwtUserDetails principal
    ) {
        return noticeService.getNotices(principal.getUserId());
    }

    @Operation(
            summary = "알림 전체 삭제", description = "로그인한 사용자의 알림을 모두 삭제합니다."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "알림 전체 삭제 성공"),
            @ApiResponse(responseCode = "401", description = "인증 실패 (JWT 토큰 누락 또는 만료)"),
            @ApiResponse(responseCode = "500", description = "서버 오류")
    })
    @DeleteMapping("/delete")
    public void deleteAll(
            @Parameter(hidden = true) HttpServletRequest request,
            @AuthenticationPrincipal JwtUserDetails principal
    ) {
        noticeService.deleteAllNotices(principal.getUserId());
    }

    /**
     * ✅ 콕 찌르기 알림 (상대방이 나를 찔렀을 때, 내가 알림 받음)
     */
   /* @PostMapping("/poke")
    public void receivePoke(
            @Parameter(hidden = true) HttpServletRequest request,
            @AuthenticationPrincipal JwtUserDetails principal
    ) {
        noticeService.receivePoke(principal.getUserId());
    }

    *//**
     * ✅ 마니또 추측 알림 (상대방이 나를 마니또로 추측했을 때, 내가 알림 받음)
     *//*
    @PostMapping("/guess")
    public void receiveGuess(
            @Parameter(hidden = true) HttpServletRequest request,
            @AuthenticationPrincipal JwtUserDetails principal
    ) {
        noticeService.receiveGuess(principal.getUserId());
    }*/
}
