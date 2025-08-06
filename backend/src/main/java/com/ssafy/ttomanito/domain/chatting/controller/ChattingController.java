package com.ssafy.ttomanito.domain.chatting.controller;

import com.ssafy.ttomanito.domain.chatting.message.dto.ChatMessageDto;
import com.ssafy.ttomanito.domain.chatting.room.dto.ChatRoomListDto;
import com.ssafy.ttomanito.domain.chatting.room.dto.ChattingRoomDto;
import com.ssafy.ttomanito.domain.chatting.service.ChattingService;
import com.ssafy.ttomanito.domain.chatting.voice.repository.VoiceChatRepository;
import com.ssafy.ttomanito.domain.chatting.voice.service.VoiceChatService;
import com.ssafy.ttomanito.domain.room.entity.RoomUser;
import com.ssafy.ttomanito.domain.room.repository.RoomUserRepository;
import com.ssafy.ttomanito.global.security.userdetails.JwtUserDetails;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/chat")
@RequiredArgsConstructor
public class ChattingController {

    private final ChattingService service;
    private final SimpMessagingTemplate template;
    private final VoiceChatService voiceChatService;
    private final RoomUserRepository roomUserRepository;
    private final VoiceChatRepository voiceChatRepository;

    @GetMapping("/roomlist")
    public ResponseEntity<ChatRoomListDto> getRoomList(
            @AuthenticationPrincipal JwtUserDetails user
    ) {
        ChatRoomListDto dto = service.getRoomList(user.getUserId());
        return ResponseEntity.ok(dto);
    }

    // 1) 내가 마니또인 방
    @GetMapping("/room/manito")
    public ResponseEntity<ChattingRoomDto> getRoomsAsManito(@AuthenticationPrincipal JwtUserDetails user) {
        return ResponseEntity.ok(service.getRoomAsManito(user.getUserId()));
    }

    // 2) 내가 마니띠인 방
    @GetMapping("/room/manitee")
    public ResponseEntity<ChattingRoomDto> getRoomsAsManitee(@AuthenticationPrincipal JwtUserDetails user) {
        return ResponseEntity.ok(service.getRoomAsManitee(user.getUserId()));
    }

    // 메시지 히스토리
//    @GetMapping("/room/{chatroomId}/messages")
//    public List<ChatMessageDto> getHistory(@PathVariable Long chatroomId) {
//        return service.getHistory(chatroomId);
//    }

    // 메시지 전송 및 unread_count++
//    @PostMapping("/room/{chatroomId}/message")
//    public ResponseEntity<ChatMessageDto> sendMessage(
//            @PathVariable Long chatroomId,
//            @AuthenticationPrincipal JwtUserDetails user,
//            @RequestBody ChatMessageDto payload) {
//        ChatMessageDto saved = service.sendMessage(chatroomId, user.getUserId(), payload.content());
//        template.convertAndSend("/topic/chat." + chatroomId, saved);
//        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
//    }

    // 입장: unread_count = 0
    @PostMapping("/{chatroomId}/enter")
    public ResponseEntity<Void> enter(
            @PathVariable Long chatroomId,
            @AuthenticationPrincipal JwtUserDetails user) {
        service.markRead(chatroomId, user.getUserId());
        return ResponseEntity.ok().build();
    }


    @Operation(summary = "음성통화 시작 요청", description = "채팅방ID로 통화를 시작합니다. JWT 필요.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "요청 성공"),
            @ApiResponse(responseCode = "401", description = "인증 실패"),
            @ApiResponse(responseCode = "404", description = "채팅방 없음")
    })
    @PostMapping("/{chatroomId}/call/start")
    public ResponseEntity<Void> startCall(
            @PathVariable Long chatroomId,
            @AuthenticationPrincipal JwtUserDetails principal
    ) {
        voiceChatService.startCall(chatroomId, principal.getUserId());

        return ResponseEntity.ok().build();
    }

    @Operation(
            summary = "음성통화 승인", description = "수신자가 통화 요청을 승인합니다."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "통화 승인 성공"),
            @ApiResponse(responseCode = "400", description = "callerId 파라미터 누락"),
            @ApiResponse(responseCode = "404", description = "해당 통화 요청이 없습니다")
    })
    @PostMapping("/{chatroomId}/call/accept")
    public ResponseEntity<Void> acceptCall(
            @PathVariable Long chatroomId,
            @RequestParam(name = "userId") Long callerId
    ) {
        voiceChatService.acceptCall(chatroomId, callerId);
        return ResponseEntity.ok().build();
    }

    @Operation(
            summary = "음성통화 거절", description = "수신자가 통화 요청을 거절합니다."
    )
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

    @Operation(
            summary = "음성통화 종료", description = "통화 중인 사용자가 통화를 종료합니다."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "통화 종료 성공"),
            @ApiResponse(responseCode = "401", description = "인증 정보 누락 또는 유효하지 않음"),
            @ApiResponse(responseCode = "404", description = "해당 통화 세션을 찾을 수 없습니다")
    })
    @PostMapping("/{chatroomId}/call/end")
    public ResponseEntity<Void> endCall(
            @PathVariable("chatroomId") Long chatroomId,
            @AuthenticationPrincipal JwtUserDetails principal
    ) {

        // 실제 종료 로직 호출
        Long userId = principal.getUserId();
        voiceChatService.endCall(chatroomId, userId);
        return ResponseEntity.ok().build();
    }

        // 퇴장: last_message 동기화
//    @PostMapping("/{chatroomId}/exit")
//    public ResponseEntity<Void> exit(
//            @PathVariable Long chatroomId,
//            @AuthenticationPrincipal JwtUserDetails user) {
//        service.leaveRoom(chatroomId, user.getUserId());
//        return ResponseEntity.ok().build();
//    }
//
//    @GetMapping("/{chatroomId}/unread")
//    public ResponseEntity<Integer> getUnreadCount(
//            @PathVariable Long chatroomId,
//            @RequestParam Long userId
//    ) {
//        return ResponseEntity.ok(service.getUnreadCount(chatroomId, userId));
//    }
}