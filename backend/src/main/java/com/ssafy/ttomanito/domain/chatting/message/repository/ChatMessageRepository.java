package com.ssafy.ttomanito.domain.chatting.message.repository;

import com.ssafy.ttomanito.domain.chatting.message.entity.ChatMessage;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface ChatMessageRepository extends MongoRepository<ChatMessage, String> {
    /** 가장 최근 50개(내림차순) */
    List<ChatMessage> findTop50ByChattingRoomIdOrderBySentAtDesc(Long chattingRoomId);

    /** before 시점 이전의 메시지 중 최신 50개(내림차순) */
    List<ChatMessage> findByChattingRoomIdAndSentAtBefore(
            Long chattingRoomId,
            LocalDateTime before,
            Pageable pageable
    );

    /** 가장 최근 단일 메시지(새 메시지 알림용) */
    Optional<ChatMessage> findTopByChattingRoomIdOrderBySentAtDesc(Long chattingRoomId);
}
