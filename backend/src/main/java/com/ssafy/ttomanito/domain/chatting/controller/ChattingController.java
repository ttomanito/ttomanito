package com.ssafy.ttomanito.domain.chatting.controller;

import com.ssafy.ttomanito.domain.chatting.message.dto.ChatMessageDto;
import com.ssafy.ttomanito.domain.chatting.room.dto.ChattingRoomDto;
import com.ssafy.ttomanito.domain.chatting.service.ChattingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/chat")
@RequiredArgsConstructor
public class ChattingController {

    private final ChattingService chattingService;
    private final SimpMessagingTemplate template;

    /** 채팅 방 목록 조회 */
    @GetMapping("/roomlist")
    public ResponseEntity<List<ChattingRoomDto>> getRoomList(@RequestParam Long userId) {
        // TODO: chattingService.getRooms(userId)
        return ResponseEntity.ok(List.of());
    }

    /** 채팅방 id 생성/조회 */
    @GetMapping("/room")
    public ResponseEntity<Long> getRoomId(@RequestParam Long manitoAssignmentId) {
        // TODO: chattingService.getOrCreateRoom(manitoAssignmentId)
        return ResponseEntity.ok(0L);
    }

    /** 과거 메시지 조회 */
    @GetMapping("/room/{roomId}/messages")
    public ResponseEntity<List<ChatMessageDto>> getHistory(@PathVariable Long roomId) {
        return ResponseEntity.ok(chattingService.getHistory(roomId));
    }

    /** 메시지 전송 */
    @PostMapping("/room/{roomId}/message")
    public ResponseEntity<ChatMessageDto> sendMessage(
            @PathVariable Long roomId,
            @RequestBody ChatMessageDto payload
    ) {
        ChatMessageDto saved = chattingService.saveMessage(
                new ChatMessageDto(roomId, payload.senderRoomUserId(), payload.content(), null)
        );
        template.convertAndSend("/topic/chat." + roomId, saved);
        return new ResponseEntity<>(saved, HttpStatus.CREATED);
    }

    /** 채팅방 입장 */
    @PostMapping("/{roomId}/enter")
    public ResponseEntity<Void> enterRoom(@PathVariable Long roomId, @RequestParam Long userId) {
        // TODO: chattingService.enterRoom(roomId, userId)
        return ResponseEntity.ok().build();
    }

    /** 채팅방 나가기 */
    @PostMapping("/{roomId}/exit")
    public ResponseEntity<Void> exitRoom(@PathVariable Long roomId, @RequestParam Long userId) {
        // TODO: chattingService.exitRoom(roomId, userId)
        return ResponseEntity.ok().build();
    }

    /** 안읽은 메시지 개수 조회 */
    @GetMapping("/{roomId}/unread")
    public ResponseEntity<Integer> getUnreadCount(
            @PathVariable Long roomId,
            @RequestParam Long userId
    ) {
        // TODO: chattingService.getUnreadCount(roomId, userId)
        return ResponseEntity.ok(0);
    }

    /** 음성통화 시작 요청 */
    @PostMapping("/{roomId}/call/start")
    public ResponseEntity<Void> startCall(
            @PathVariable Long roomId,
            @RequestParam Long userId
    ) {
        // TODO: chattingService.startCall(roomId, userId)
        return ResponseEntity.ok().build();
    }

    /** 음성통화 승인 */
    @PostMapping("/{roomId}/call/accept")
    public ResponseEntity<Void> acceptCall(@PathVariable Long roomId, @RequestParam Long userId) {
        // TODO: chattingService.acceptCall(roomId, userId)
        return ResponseEntity.ok().build();
    }

    /** 음성통화 거절 */
    @PostMapping("/{roomId}/call/reject")
    public ResponseEntity<Void> rejectCall(@PathVariable Long roomId, @RequestParam Long userId) {
        // TODO: chattingService.rejectCall(roomId, userId)
        return ResponseEntity.ok().build();
    }

    /** 음성통화 종료 */
    @PostMapping("/{roomId}/call/end")
    public ResponseEntity<Void> endCall(@PathVariable Long roomId, @RequestParam Long userId) {
        // TODO: chattingService.endCall(roomId, userId)
        return ResponseEntity.ok().build();
    }
}