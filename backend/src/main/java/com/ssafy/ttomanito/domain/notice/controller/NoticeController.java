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
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
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
            @ApiResponse(responseCode = "200", description = "알림 목록 조회 성공"), @ApiResponse(responseCode = "401", description = "인증 실패 (JWT 토큰 만료 또는 누락)"),
            @ApiResponse(responseCode = "500", description = "서버 오류")
    })
    @GetMapping
    public List<NoticeResponse> getNoticeList(
            @Parameter(hidden = true) HttpServletRequest request,
            @AuthenticationPrincipal JwtUserDetails principal
    ) {
        return noticeService.getNotices(principal.getUserId());
    }

    @PatchMapping("/check")
    @Operation(summary = "전체 알림 읽음 처리", description = "해당 사용자의 모든 알림을 읽음 상태로 변경합니다.")
    public void markAllAsRead(
            @Parameter(hidden = true) @AuthenticationPrincipal JwtUserDetails principal
    ) {
        noticeService.markAllAsRead(principal.getUserId());
    }

    @Operation(
            summary = "알림 전체 삭제", description = "로그인한 사용자의 알림을 모두 삭제합니다."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "알림 전체 삭제 성공"), @ApiResponse(responseCode = "401", description = "인증 실패 (JWT 토큰 누락 또는 만료)"),
            @ApiResponse(responseCode = "500", description = "서버 오류")
    })
    @DeleteMapping("/delete")
    public void deleteAll(
            @Parameter(hidden = true) HttpServletRequest request,
            @AuthenticationPrincipal JwtUserDetails principal
    ) {
        noticeService.deleteAllNotices(principal.getUserId());
    }

    @Operation(
            summary = "콕 찌르기 알림", description = "마니또가 마니띠를 콕 찌르면, 해당 마니띠에게 알림을 전송합니다."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "콕 찌르기 알림 전송 성공"), @ApiResponse(responseCode = "401", description = "인증 실패"),
            @ApiResponse(responseCode = "404", description = "마니또 또는 마니띠 정보 없음"), @ApiResponse(responseCode = "500", description = "서버 오류")
    })
    @PostMapping("/poke")
    public void createPokeNotice(@AuthenticationPrincipal JwtUserDetails principal) {
        noticeService.createPokeNotice(principal.getUserId());
    }


    @Operation(
            summary = "마니또 추측 알림", description = "마니띠가 마니또를 추측하면, 마니또에게 알림을 전송합니다."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "추측 알림 전송 성공"), @ApiResponse(responseCode = "401", description = "인증 실패"),
            @ApiResponse(responseCode = "404", description = "마니또 정보 없음"), @ApiResponse(responseCode = "500", description = "서버 오류")
    })
    @PostMapping("/guess")
    public void createGuessNotice(@AuthenticationPrincipal JwtUserDetails principal) {
        noticeService.createGuessNotice(principal.getUserId());
    }

    @Operation(summary = "게임 종료 알림 전송", description = "해당 방의 모든 유저에게 게임 종료 알림(FINISHED)을 보냅니다.")
    @ApiResponse(responseCode = "200", description = "게임 종료 알림 전송 완료")
    @PostMapping("/{roomId}/finish")
    public ResponseEntity<Void> sendFinishNotices(@PathVariable Long roomId) {
        noticeService.createFinishNoticeForRoom(roomId);
        return ResponseEntity.ok().build();
    }

    @Operation(
            summary = "사용자 탈퇴 알림 전송", description = "탈퇴한 사용자의 마니또 및 마니띠에게 탈퇴 알림(EXIT)을 전송합니다."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "탈퇴 알림 전송 완료"), @ApiResponse(responseCode = "401", description = "인증 실패"),
            @ApiResponse(responseCode = "404", description = "마니또/마니띠 정보 없음"), @ApiResponse(responseCode = "500", description = "서버 오류")
    })
    @PostMapping("/exit")
    @ResponseStatus(HttpStatus.CREATED)
    public void sendExitNotices(@AuthenticationPrincipal JwtUserDetails principal) {
        noticeService.createExitNotices(principal.getUserId());
    }
}
