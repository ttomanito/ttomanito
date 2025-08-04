package com.ssafy.ttomanito.domain.chatting.message.repository;

import com.ssafy.ttomanito.domain.chatting.message.entity.ChatMessage;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface ChatMessageRepository extends MongoRepository<ChatMessage, String> {
    List<ChatMessage> findTop50ByChattingRoomIdOrderBySentAtAsc(Long chattingRoomId);
}
