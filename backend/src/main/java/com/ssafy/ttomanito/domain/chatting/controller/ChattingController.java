package com.ssafy.ttomanito.domain.chatting.controller;

import com.ssafy.ttomanito.domain.chatting.room.dto.ChatRoomListDto;
import com.ssafy.ttomanito.domain.chatting.room.dto.ChattingRoomDto;
import com.ssafy.ttomanito.domain.chatting.service.ChattingService;
import com.ssafy.ttomanito.domain.chatting.voice.service.VoiceChatService;
import com.ssafy.ttomanito.global.security.userdetails.JwtUserDetails;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/chat")
@RequiredArgsConstructor
public class ChattingController {

    private final ChattingService service;
    private final VoiceChatService voiceChatService;

    @Operation(summary = "채팅방 목록 조회", description = "현재 사용자가 속한 마니또/마니띠 채팅방 정보를 조회합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "채팅방 목록 조회 성공"),
            @ApiResponse(responseCode = "401", description = "인증 실패")
    })
    @GetMapping("/roomlist")
    public ResponseEntity<ChatRoomListDto> getRoomList(
            @AuthenticationPrincipal JwtUserDetails user
    ) {
        ChatRoomListDto dto = service.getRoomList(user.getUserId());
        return ResponseEntity.ok(dto);
    }

    @Operation(summary = "내가 마니또인 방 조회", description = "현재 사용자가 마니또로 참여 중인 채팅방 정보를 조회합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "마니또 채팅방 조회 성공"),
            @ApiResponse(responseCode = "401", description = "인증 실패"),
            @ApiResponse(responseCode = "404", description = "진행 중인 채팅방이 없습니다")
    })
    @GetMapping("/room/manito")
    public ResponseEntity<ChattingRoomDto> getRoomsAsManito(
            @AuthenticationPrincipal JwtUserDetails user
    ) {
        ChattingRoomDto dto = service.getRoomAsManito(user.getUserId());
        return ResponseEntity.ok(dto);
    }

    @Operation(summary = "내가 마니띠인 방 조회", description = "현재 사용자가 마니띠로 참여 중인 채팅방 정보를 조회합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "마니띠 채팅방 조회 성공"),
            @ApiResponse(responseCode = "401", description = "인증 실패"),
            @ApiResponse(responseCode = "404", description = "진행 중인 채팅방이 없습니다")
    })
    @GetMapping("/room/manitee")
    public ResponseEntity<ChattingRoomDto> getRoomsAsManitee(
            @AuthenticationPrincipal JwtUserDetails user
    ) {
        ChattingRoomDto dto = service.getRoomAsManitee(user.getUserId());
        return ResponseEntity.ok(dto);
    }

    @Operation(summary = "채팅방 입장", description = "채팅방에 입장하여 unread_count를 0으로 초기화하고 마지막 읽은 시간을 갱신합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "입장 처리 성공"),
            @ApiResponse(responseCode = "401", description = "인증 실패"),
            @ApiResponse(responseCode = "404", description = "진행 중인 채팅방이 없습니다")
    })
    @PostMapping("/{chatroomId}/enter")
    public ResponseEntity<Void> enter(
            @PathVariable("chatroomId") Long chatroomId,
            @AuthenticationPrincipal JwtUserDetails user
    ) {
        service.markRead(chatroomId, user.getUserId());
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "음성통화 시작 요청", description = "채팅방 ID로 음성 통화를 시작합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "통화 시작 요청 성공"),
            @ApiResponse(responseCode = "401", description = "인증 실패"),
            @ApiResponse(responseCode = "404", description = "해당 채팅방이 없습니다")
    })
    @PostMapping("/{chatroomId}/call/start")
    public ResponseEntity<Void> startCall(
            @PathVariable("chatroomId") Long chatroomId,
            @AuthenticationPrincipal JwtUserDetails user
    ) {
        voiceChatService.startCall(chatroomId, user.getUserId());
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "음성통화 승인", description = "수신자가 통화 요청을 승인합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "통화 승인 성공"),
            @ApiResponse(responseCode = "400", description = "callerId 파라미터 누락"),
            @ApiResponse(responseCode = "404", description = "해당 통화 요청이 없습니다")
    })
    @PostMapping("/{chatroomId}/call/accept")
    public ResponseEntity<Void> acceptCall(
            @PathVariable("chatroomId") Long chatroomId,
            @RequestParam(name = "userId") Long callerId
    ) {
        voiceChatService.acceptCall(chatroomId, callerId);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "음성통화 거절", description = "수신자가 통화 요청을 거절합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "통화 거절 성공"),
            @ApiResponse(responseCode = "400", description = "callerId 파라미터 누락"),
            @ApiResponse(responseCode = "404", description = "해당 통화 요청이 없습니다")
    })
    @PostMapping("/{chatroomId}/call/reject")
    public ResponseEntity<Void> rejectCall(
            @PathVariable("chatroomId") Long chatroomId,
            @RequestParam("userId") Long callerId
    ) {
        voiceChatService.rejectCall(chatroomId, callerId);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "음성통화 종료", description = "통화 중인 사용자가 음성 통화를 종료합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "통화 종료 성공"),
            @ApiResponse(responseCode = "401", description = "인증 실패"),
            @ApiResponse(responseCode = "404", description = "해당 통화 세션을 찾을 수 없습니다")
    })
    @PostMapping("/{chatroomId}/call/end")
    public ResponseEntity<Void> endCall(
            @PathVariable("chatroomId") Long chatroomId,
            @AuthenticationPrincipal JwtUserDetails user
    ) {
        voiceChatService.endCall(chatroomId, user.getUserId());
        return ResponseEntity.ok().build();
    }
}
