package com.ssafy.ttomanito.domain.notice.controller;

import com.ssafy.ttomanito.domain.notice.dto.NoticeResponse;
import com.ssafy.ttomanito.domain.notice.service.NoticeService;
import io.swagger.v3.oas.annotations.Parameter;
import com.ssafy.ttomanito.global.security.userdetails.JwtUserDetails;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/notice")
public class NoticeController {

    private final NoticeService noticeService;

    /**
     * ✅ 알림 목록 조회
     */
    @GetMapping
    public List<NoticeResponse> getNoticeList(
            @Parameter(hidden = true) HttpServletRequest request,
            @AuthenticationPrincipal JwtUserDetails principal
    ) {
        return noticeService.getNotices(principal.getUserId());
    }

    /**
     * ✅ 알림 전체 삭제
     */
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
