package com.ssafy.ttomanito.domain.chatting.service;

import com.ssafy.ttomanito.domain.chatting.message.dto.ChatMessageDto;
import com.ssafy.ttomanito.domain.chatting.room.dto.ChattingRoomDto;
import com.ssafy.ttomanito.domain.chatting.user.entity.ChattingUser;
import com.ssafy.ttomanito.domain.chatting.room.entity.ChattingRoom;
import com.ssafy.ttomanito.domain.chatting.message.entity.ChatMessage;
import com.ssafy.ttomanito.domain.chatting.message.repository.ChatMessageRepository;
import com.ssafy.ttomanito.domain.chatting.room.repository.ChattingRoomRepository;
import com.ssafy.ttomanito.domain.chatting.user.repository.ChattingUserRepository;
import com.ssafy.ttomanito.domain.manito.repository.ManitoAssignmentRepository;
import com.ssafy.ttomanito.domain.room.repository.RoomUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ChattingService {
    private final ChatMessageRepository msgRepo;
    private final ChattingRoomRepository roomRepo;
    private final ChattingUserRepository userRepo;
    private final ManitoAssignmentRepository maRepo;
    private final RoomUserRepository ruRepo;

    public List<ChattingRoomDto> getRooms(Long userId) {
        return userRepo.findAllByRoomUserUserUserId(userId).stream()
                .map(cu -> {
                    ChattingRoom r = cu.getChattingRoom();
                    return new ChattingRoomDto(
                            r.getChattingRoomId(),
                            r.getManitoAssignment().getManitoAssignmentId(),
                            r.getLastMessage(),
                            r.getLastMessageTime()
                    );
                })
                .collect(Collectors.toList());
    }

    public Long getOrCreateRoom(Long maId) {
        var ma = maRepo.findById(maId).orElseThrow();
        var room = roomRepo.findByManitoAssignmentManitoAssignmentId(maId)
                .orElseGet(() -> roomRepo.save(
                        ChattingRoom.builder()
                                .manitoAssignment(ma)
                                .build()
                ));
        return room.getChattingRoomId();
    }

    public void enterRoom(Long roomId, Long userId) {
        var room = roomRepo.findById(roomId).orElseThrow();
        var ru = ruRepo.findByRoomRoomIdAndUserUserId(roomId, userId).orElseThrow();
        var cu = ChattingUser.builder()
                .chattingRoom(room)
                .roomUser(ru)
                .unreadCount(0)
                .lastReadTime(LocalDateTime.now())
                .build();
        userRepo.save(cu);
    }

    public void exitRoom(Long roomId, Long userId) {
        var cu = userRepo.findByChattingRoomChattingRoomIdAndRoomUserRoomUserId(roomId, userId)
                .orElseThrow();
        userRepo.delete(cu);
    }

    public int getUnreadCount(Long roomId, Long userId) {
        return userRepo.findByChattingRoomChattingRoomIdAndRoomUserRoomUserId(roomId, userId)
                .map(ChattingUser::getUnreadCount)
                .orElse(0);
    }

    public ChatMessageDto saveMessage(ChatMessageDto dto) {
        var msg = ChatMessage.create(
                dto.chattingRoomId(),
                dto.senderRoomUserId(),
                dto.content()
        );
        var saved = msgRepo.save(msg);
        return new ChatMessageDto(
                saved.getChattingRoomId(),
                saved.getSenderRoomUserId(),
                saved.getContent(),
                saved.getSentAt()
        );
    }

    public List<ChatMessageDto> getHistory(Long roomId) {
        return msgRepo.findTop50ByChattingRoomIdOrderBySentAtAsc(roomId).stream()
                .map(m -> new ChatMessageDto(
                        m.getChattingRoomId(),
                        m.getSenderRoomUserId(),
                        m.getContent(),
                        m.getSentAt()
                ))
                .collect(Collectors.toList());
    }
}