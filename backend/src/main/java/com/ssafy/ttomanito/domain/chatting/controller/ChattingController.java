package com.ssafy.ttomanito.domain.chatting.controller;

import com.ssafy.ttomanito.domain.chatting.message.dto.ChatMessageDto;
import com.ssafy.ttomanito.domain.chatting.room.dto.ChatRoomListDto;
import com.ssafy.ttomanito.domain.chatting.room.dto.ChattingRoomDto;
import com.ssafy.ttomanito.domain.chatting.service.ChattingService;
import com.ssafy.ttomanito.global.security.userdetails.JwtUserDetails;
import lombok.RequiredArgsConstructor;
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