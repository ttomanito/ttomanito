package com.ssafy.ttomanito.domain.chatting.service;

import com.ssafy.ttomanito.domain.chatting.message.dto.ChatMessageDto;
import com.ssafy.ttomanito.domain.chatting.message.entity.ChatMessage;
import com.ssafy.ttomanito.domain.chatting.message.repository.ChatMessageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ChattingService {
    private final ChatMessageRepository repo;

    public ChatMessageDto saveMessage(ChatMessageDto dto) {
        ChatMessage msg = ChatMessage.create(
                dto.chattingRoomId(),
                dto.senderRoomUserId(),
                dto.content()
        );
        ChatMessage saved = repo.save(msg);
        return new ChatMessageDto(
                saved.getChattingRoomId(),
                saved.getSenderRoomUserId(),
                saved.getContent(),
                saved.getSentAt()
        );
    }

    public List<ChatMessageDto> getHistory(Long roomId) {
        return repo.findTop50ByChattingRoomIdOrderBySentAtAsc(roomId)
                .stream()
                .map(m -> new ChatMessageDto(
                        m.getChattingRoomId(),
                        m.getSenderRoomUserId(),
                        m.getContent(),
                        m.getSentAt()
                ))
                .collect(Collectors.toList());
    }

    // TODO: 추가 서비스 메서드 (chat room 생성, 입장, 나가기, unread count, call 관리 등)
}