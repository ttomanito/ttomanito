package com.ssafy.ttomanito.domain.chatting.message.repository;

import com.ssafy.ttomanito.domain.chatting.message.entity.ChatMessage;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.Aggregation;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface ChatMessageRepository extends MongoRepository<ChatMessage, String> {
    /**
     * 가장 최근 50개(내림차순)
     */
    List<ChatMessage> findTop50ByChattingRoomIdOrderBySentAtDesc(Long chattingRoomId);

    /**
     * before 시점 이전의 메시지 중 최신 50개(내림차순)
     */
    List<ChatMessage> findByChattingRoomIdAndSentAtBefore(
            Long chattingRoomId,
            LocalDateTime before,
            Pageable pageable
    );

    interface ChatCount {
        Long getChattingRoomId();

        Long getSenderRoomUserId();

        Long getCount();
    }

    @Aggregation(pipeline = {
            // 1) 기간 필터
            "{ '$match': { 'sentAt': { $gte: ?0, $lt: ?1 } } }",
            // 2) chattingRoomId, senderRoomUserId 두 필드로 그룹핑
            "{ '$group': { '_id': { room: '$chattingRoomId', sender: '$senderRoomUserId' }, 'count': { $sum: 1 } } }",
            // 3) projection: _id.room → chattingRoomId, _id.sender → senderRoomUserId
            "{ '$project': { 'chattingRoomId': '$_id.room', 'senderRoomUserId': '$_id.sender', 'count': 1, '_id': 0 } }"
    })
    List<ChatCount> countBySentAtBetweenGroupByRoomAndSender(LocalDateTime start, LocalDateTime end);

    /**
     * 가장 최근 단일 메시지(새 메시지 알림용)
     */
    Optional<ChatMessage> findTopByChattingRoomIdOrderBySentAtDesc(Long chattingRoomId);

    long countBySenderRoomUserIdAndSentAtBetween(
            Long senderRoomUserId,
            LocalDateTime start,
            LocalDateTime end
    );
    // 방 전체 메시지 수 (둘의 합산)
    @Aggregation(pipeline = {
            "{ '$match': { 'chattingRoomId': ?0 } }",
            "{ '$count': 'count' }"
    })
    Optional<ChatCount> countAllByRoom(Long chattingRoomId);
}
