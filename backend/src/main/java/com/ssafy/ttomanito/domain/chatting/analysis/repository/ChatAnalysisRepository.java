package com.ssafy.ttomanito.domain.chatting.analysis.repository;

import com.ssafy.ttomanito.domain.chatting.analysis.entity.ChatAnalysisDoc;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface ChatAnalysisRepository extends MongoRepository<ChatAnalysisDoc, String> {
    Optional<ChatAnalysisDoc> findByChatRoomIdAndRequestedBy(Long chatRoomId, Long requestedBy);
    boolean existsByChatRoomIdAndRequestedBy(Long chatRoomId, Long requestedBy);
}
