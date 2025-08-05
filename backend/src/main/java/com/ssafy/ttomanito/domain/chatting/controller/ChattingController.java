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

    private final ChattingService service;
    private final SimpMessagingTemplate template;

    @GetMapping("/roomlist")
    public ResponseEntity<List<ChattingRoomDto>> getChatRoomList(@RequestParam Long userId) {
        return ResponseEntity.ok(service.getRooms(userId));
    }

    @GetMapping("/room")
    public ResponseEntity<Long> getChatRoomId(@RequestParam Long manitoAssignmentId) {
        return ResponseEntity.ok(service.getOrCreateRoom(manitoAssignmentId));
    }

    @GetMapping("/room/{chatroomId}/messages")
    public ResponseEntity<List<ChatMessageDto>> getHistory(@PathVariable Long chatroomId) {
        return ResponseEntity.ok(service.getHistory(chatroomId));
    }

    @PostMapping("/room/{chatroomId}/message")
    public ResponseEntity<ChatMessageDto> sendMessage(
            @PathVariable Long chatroomId,
            @RequestBody ChatMessageDto payload
    ) {
        var saved = service.saveMessage(
                new ChatMessageDto(chatroomId, payload.senderRoomUserId(), payload.content(), null)
        );
        template.convertAndSend("/topic/chat." + chatroomId, saved);
        return new ResponseEntity<>(saved, HttpStatus.CREATED);
    }

    @PostMapping("/{chatroomId}/enter")
    public ResponseEntity<Void> enterChatRoom(@PathVariable Long chatroomId, @RequestParam Long userId) {
        service.enterRoom(chatroomId, userId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{chatroomId}/exit")
    public ResponseEntity<Void> exitChatRoom(@PathVariable Long chatroomId, @RequestParam Long userId) {
        service.exitRoom(chatroomId, userId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{chatroomId}/unread")
    public ResponseEntity<Integer> getUnreadCount(
            @PathVariable Long chatroomId,
            @RequestParam Long userId
    ) {
        return ResponseEntity.ok(service.getUnreadCount(chatroomId, userId));
    }
}