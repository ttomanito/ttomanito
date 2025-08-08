package com.ssafy.ttomanito.domain.notice.controller;

import com.ssafy.ttomanito.domain.notice.dto.NoticeResponse;
import com.ssafy.ttomanito.domain.notice.service.NoticeService;
import com.ssafy.ttomanito.global.security.userdetails.JwtUserDetails;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequiredArgsConstructor
@RequestMapping("/notice")
@Tag(name = "알림", description = "알림 관련 API")
public class NoticeController {

    private final NoticeService noticeService;

    @Operation(summary = "알림 목록 조회", description = "로그인한 사용자의 읽지 않은 알림 목록을 반환합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "알림 목록 조회 성공"),
            @ApiResponse(responseCode = "401", description = "인증 실패")
    })
    @GetMapping
    public ResponseEntity<List<NoticeResponse>> getNoticeList(
            @Parameter(hidden = true) @AuthenticationPrincipal JwtUserDetails user
    ) {
        List<NoticeResponse> list = noticeService.getNotices(user.getUserId());
        return ResponseEntity.ok(list);
    }

    @Operation(summary = "전체 알림 읽음 처리", description = "모든 알림을 읽음 상태로 변경합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "읽음 처리 성공"),
            @ApiResponse(responseCode = "404", description = "읽지 않은 알림이 없습니다"),
            @ApiResponse(responseCode = "401", description = "인증 실패")
    })
    @PatchMapping("/check")
    public ResponseEntity<Void> markAllAsRead(
            @Parameter(hidden = true) @AuthenticationPrincipal JwtUserDetails user
    ) {
        noticeService.markAllAsRead(user.getUserId());
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "알림 전체 삭제", description = "모든 알림을 삭제합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "삭제 성공"),
            @ApiResponse(responseCode = "401", description = "인증 실패")
    })
    @DeleteMapping("/delete")
    public ResponseEntity<Void> deleteAll(
            @Parameter(hidden = true) @AuthenticationPrincipal JwtUserDetails user
    ) {
        noticeService.deleteAllNotices(user.getUserId());
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "콕 찌르기 알림 전송", description = "마니또가 마니띠를 콕 찌르면 해당 유저에게 알림을 생성합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "알림 생성 성공"),
            @ApiResponse(responseCode = "404", description = "참여 중인 방 또는 마니또 정보가 없습니다"),
            @ApiResponse(responseCode = "401", description = "인증 실패")
    })
    @PostMapping("/poke")
    public ResponseEntity<Void> createPokeNotice(
            @Parameter(hidden = true) @AuthenticationPrincipal JwtUserDetails user
    ) {
        noticeService.createPokeNotice(user.getUserId());
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @Operation(summary = "추측 알림 전송", description = "마니띠가 마니또를 추측하면 해당 유저에게 알림을 생성합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "알림 생성 성공"),
            @ApiResponse(responseCode = "404", description = "참여 중인 방 또는 마니또 정보가 없습니다"),
            @ApiResponse(responseCode = "401", description = "인증 실패")
    })
    @PostMapping("/guess")
    public ResponseEntity<Void> createGuessNotice(
            @Parameter(hidden = true) @AuthenticationPrincipal JwtUserDetails user
    ) {
        noticeService.createGuessNotice(user.getUserId());
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @Operation(summary = "게임 종료 알림 전송", description = "해당 방의 모든 유저에게 게임 종료 알림을 전송합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "알림 전송 성공"),
            @ApiResponse(responseCode = "404", description = "해당 방의 사용자가 없습니다"),
            @ApiResponse(responseCode = "401", description = "인증 실패")
    })
    @PostMapping("/{roomId}/finish")
    public ResponseEntity<Void> sendFinishNotices(
            @Parameter(description = "방 ID", required = true) @PathVariable Long roomId
    ) {
        noticeService.createFinishNoticeForRoom(roomId);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "탈퇴 알림 전송", description = "탈퇴한 사용자의 마니또/마니띠에게 탈퇴 알림을 전송합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "알림 전송 성공"),
            @ApiResponse(responseCode = "404", description = "참여 중인 방 또는 마니또/마니띠 정보가 없습니다"),
            @ApiResponse(responseCode = "401", description = "인증 실패")
    })
    @PostMapping("/exit")
    public ResponseEntity<Void> sendExitNotices(
            @Parameter(hidden = true) @AuthenticationPrincipal JwtUserDetails user
    ) {
        noticeService.createExitNotices(user.getUserId());
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }
}
