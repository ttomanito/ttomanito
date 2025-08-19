package com.ssafy.ttomanito.domain.chatting.message.entity;

import com.ssafy.ttomanito.domain.chatting.message.dto.MessageType;
import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDateTime;
import java.time.ZoneId;

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
    private Long senderUserId;
    private String content;
    private LocalDateTime sentAt;

    @Field("type")
    private MessageType type;

    /** 텍스트 메시지 전용 팩토리 */
    public static ChatMessage createText(Long roomId, Long senderRoomUserId, Long senderUserId, String content) {
        return ChatMessage.builder()
                .chattingRoomId(roomId)
                .senderRoomUserId(senderRoomUserId)
                .senderUserId(senderUserId)
                .content(content)
                .type(MessageType.TEXT)
                .sentAt(LocalDateTime.now(ZoneId.of("Asia/Seoul")))
                .build();
    }

    /** 이벤트 메시지(POKE/CALL_*) 전용 팩토리 (content 없음 가능) */
    public static ChatMessage createEvent(Long roomId, Long senderRoomUserId, Long senderUserId, MessageType type) {
        return ChatMessage.builder()
                .chattingRoomId(roomId)
                .senderRoomUserId(senderRoomUserId)
                .senderUserId(senderUserId)
                .type(type)
                .sentAt(LocalDateTime.now(ZoneId.of("Asia/Seoul")))
                .build();
    }
}
