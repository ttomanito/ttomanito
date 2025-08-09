package com.ssafy.ttomanito.domain.chatting.message.entity;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "chat_message")
@Getter
@ToString
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@Builder(toBuilder = true)
public class ChatMessage {
    @Id
    private String chatId;
    private Long chattingRoomId;
    private Long senderRoomUserId;
    private String content;
    private LocalDateTime sentAt;

    /**
     * 정적 팩토리: 메시지 생성 시점에 sentAt 세팅
     */
    public static ChatMessage create(Long chattingRoomId, Long senderRoomUserId, String content) {
        return ChatMessage.builder()
                .chattingRoomId(chattingRoomId)
                .senderRoomUserId(senderRoomUserId)
                .content(content)
                .sentAt(LocalDateTime.now())
                .build();
    }
}