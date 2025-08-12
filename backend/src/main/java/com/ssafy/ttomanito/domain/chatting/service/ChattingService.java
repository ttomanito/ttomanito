package com.ssafy.ttomanito.domain.chatting.service;

import com.ssafy.ttomanito.domain.chatting.message.dto.ChatMessageDto;
import com.ssafy.ttomanito.domain.chatting.message.dto.MessageType;
import com.ssafy.ttomanito.domain.chatting.message.entity.ChatMessage;
import com.ssafy.ttomanito.domain.chatting.message.repository.ChatMessageRepository;
import com.ssafy.ttomanito.domain.chatting.room.dto.ChatRoomListDto;
import com.ssafy.ttomanito.domain.chatting.room.dto.ChattingRoomDto;
import com.ssafy.ttomanito.domain.chatting.room.entity.ChattingRoom;
import com.ssafy.ttomanito.domain.chatting.room.repository.ChattingRoomRepository;
import com.ssafy.ttomanito.domain.chatting.user.dto.ChatRoomWithUserDto;
import com.ssafy.ttomanito.domain.chatting.user.dto.ChattingUserDto;
import com.ssafy.ttomanito.domain.chatting.user.entity.ChattingUser;
import com.ssafy.ttomanito.domain.chatting.user.repository.ChattingUserRepository;
import com.ssafy.ttomanito.domain.manito.entity.ManitoAssignment;
import com.ssafy.ttomanito.domain.manito.repository.ManitoAssignmentRepository;
import com.ssafy.ttomanito.domain.room.entity.RoomStatus;
import com.ssafy.ttomanito.domain.room.entity.RoomUser;
import com.ssafy.ttomanito.domain.room.repository.RoomUserRepository;
import com.ssafy.ttomanito.global.exception.NotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Objects;
import java.util.concurrent.ThreadLocalRandom;

@Service
@RequiredArgsConstructor
@Transactional
public class ChattingService {
    private final RoomUserRepository ruRepo;
    private final ManitoAssignmentRepository maRepo;
    private final ChattingRoomRepository chatRoomRepo;
    private final ChattingUserRepository chatUserRepo;
    private final ChatMessageRepository chatMsgRepo;

    @Transactional(readOnly = true)
    public boolean isUserInChatRoom(Long chatRoomId, Long userId) {
        // userId → RoomUser
        return chatUserRepo.findAllByChattingRoomChattingRoomId(chatRoomId).stream()
                .anyMatch(cu -> cu.getRoomUser().getUser().getUserId().equals(userId));
    }

    @Transactional(readOnly = true)
    public ChatRoomListDto getRoomList(Long userId) {
        List<RoomUser> active = ruRepo.findActiveRoomsForUser(userId, List.of(RoomStatus.IN_PROGRESS));

        ChatRoomWithUserDto manitoDto = active.stream()
                .map(ru -> maRepo.findByManito_RoomUserId(ru.getRoomUserId())
                        .map(ma -> toDto(ma.getManitoAssignmentId(), ru.getRoomUserId()))
                        .orElse(null))
                .filter(Objects::nonNull)
                .findFirst()
                .orElse(null);

        ChatRoomWithUserDto maniteeDto = active.stream()
                .map(ru -> maRepo.findByManitee_RoomUserId(ru.getRoomUserId())
                        .map(ma -> toDto(ma.getManitoAssignmentId(), ru.getRoomUserId()))
                        .orElse(null))
                .filter(Objects::nonNull)
                .findFirst()
                .orElse(null);

        return new ChatRoomListDto(manitoDto, maniteeDto);
    }

    @Transactional(readOnly = true)
    public ChattingRoomDto getRoomAsManito(Long userId) {
        RoomUser ru = ruRepo.findActiveRoomsForUser(userId, List.of(RoomStatus.IN_PROGRESS))
                .stream()
                .findFirst()
                .orElseThrow(() -> new NotFoundException("진행 중인 방이 없습니다: userId=" + userId));

        ManitoAssignment ma = maRepo.findByManito_RoomUserId(ru.getRoomUserId())
                .orElseThrow(() -> new NotFoundException("마니또 배정이 없습니다: roomUserId=" + ru.getRoomUserId()));

        ChattingRoom room = chatRoomRepo.findByManitoAssignmentManitoAssignmentId(ma.getManitoAssignmentId())
                .orElseThrow(() -> new NotFoundException("채팅방을 찾을 수 없습니다: assignmentId=" + ma.getManitoAssignmentId()));

        return new ChattingRoomDto(room.getChattingRoomId(),
                ma.getManitoAssignmentId(),
                room.getLastMessage(),
                room.getLastMessageTime());
    }

    @Transactional(readOnly = true)
    public ChattingRoomDto getRoomAsManitee(Long userId) {
        RoomUser ru = ruRepo.findActiveRoomsForUser(userId, List.of(RoomStatus.IN_PROGRESS))
                .stream()
                .findFirst()
                .orElseThrow(() -> new NotFoundException("진행 중인 방이 없습니다: userId=" + userId));

        ManitoAssignment ma = maRepo.findByManitee_RoomUserId(ru.getRoomUserId())
                .orElseThrow(() -> new NotFoundException("마니띠 배정이 없습니다: roomUserId=" + ru.getRoomUserId()));

        ChattingRoom room = chatRoomRepo.findByManitoAssignmentManitoAssignmentId(ma.getManitoAssignmentId())
                .orElseThrow(() -> new NotFoundException("채팅방을 찾을 수 없습니다: assignmentId=" + ma.getManitoAssignmentId()));

        return new ChattingRoomDto(room.getChattingRoomId(),
                ma.getManitoAssignmentId(),
                room.getLastMessage(),
                room.getLastMessageTime());
    }


    public ChatMessageDto sendText(Long chattingRoomId, Long roomUserId, String content) {
        Long senderUserId = requireSenderUserId(roomUserId);
        ChatMessage saved = chatMsgRepo.save(
                ChatMessage.createText(chattingRoomId, roomUserId, senderUserId, content)
        );
        return saveSideEffectsAndToDto(saved, summarizeForLastMessage(MessageType.TEXT, content));
    }

    public ChatMessageDto sendPoke(Long chattingRoomId, Long roomUserId) {
        Long senderUserId = requireSenderUserId(roomUserId);
        List<String> pokes = List.of("뭐해", "콕콕", "어이");
        String content = pokes.get(ThreadLocalRandom.current().nextInt(pokes.size())) + " 🫵";

        ChatMessage saved = chatMsgRepo.save(
                ChatMessage.createEvent(chattingRoomId, roomUserId, senderUserId, MessageType.POKE)
                        .toBuilder().content(content).build()
        );
        return saveSideEffectsAndToDto(saved, summarizeForLastMessage(MessageType.POKE, content));
    }

    public ChatMessageDto callStart(Long chattingRoomId, Long roomUserId) {
        Long senderUserId = requireSenderUserId(roomUserId);
        ChatMessage saved = chatMsgRepo.save(
                ChatMessage.createEvent(chattingRoomId, roomUserId, senderUserId, MessageType.CALL_START)
        );
        return saveSideEffectsAndToDto(saved, summarizeForLastMessage(MessageType.CALL_START, null));
    }

    public ChatMessageDto callAccept(Long chattingRoomId, Long roomUserId) {
        Long senderUserId = requireSenderUserId(roomUserId);
        ChatMessage saved = chatMsgRepo.save(
                ChatMessage.createEvent(chattingRoomId, roomUserId, senderUserId, MessageType.CALL_ACCEPT)
        );
        return saveSideEffectsAndToDto(saved, summarizeForLastMessage(MessageType.CALL_ACCEPT, null));
    }

    public ChatMessageDto callReject(Long chattingRoomId, Long roomUserId) {
        Long senderUserId = requireSenderUserId(roomUserId);
        ChatMessage saved = chatMsgRepo.save(
                ChatMessage.createEvent(chattingRoomId, roomUserId, senderUserId, MessageType.CALL_REJECT)
        );
        return saveSideEffectsAndToDto(saved, summarizeForLastMessage(MessageType.CALL_REJECT, null));
    }

    public List<ChatMessageDto> getHistory(Long chatRoomId, LocalDateTime before) {
        List<ChatMessage> list = (before == null)
                ? chatMsgRepo.findTop50ByChattingRoomIdOrderBySentAtDesc(chatRoomId)
                : chatMsgRepo.findByChattingRoomIdAndSentAtBefore(chatRoomId, before, PageRequest.of(0, 50, Sort.by(Sort.Direction.DESC, "sentAt")));
        Collections.reverse(list);
        return list.stream().map(this::toDto).toList();
    }

    public void markRead(Long chattingRoomId, Long userId) {
        RoomUser ru = ruRepo.findActiveRoomsForUser(userId, List.of(RoomStatus.IN_PROGRESS))
                .stream()
                .findFirst()
                .orElseThrow(() -> new NotFoundException("진행 중인 방이 없습니다: userId=" + userId));

        ChattingUser cu = chatUserRepo.findByChattingRoomChattingRoomIdAndRoomUserRoomUserId(
                        chattingRoomId, ru.getRoomUserId())
                .orElseThrow(() -> new NotFoundException("채팅유저를 찾을 수 없습니다: chattingRoomId="
                        + chattingRoomId + ", roomUserId=" + ru.getRoomUserId()));

        chatUserRepo.save(cu.toBuilder()
                .unreadCount(0)
                .lastReadTime(LocalDateTime.now())
                .build());
    }

    @Transactional(readOnly = true)
    public List<Long> findReceivers(Long chatRoomId, Long senderRoomUserId) {
        return chatUserRepo.findAllByChattingRoomChattingRoomId(chatRoomId).stream()
                .map(ChattingUser::getRoomUser)                         // RoomUser
                .filter(ru -> !ru.getRoomUserId().equals(senderRoomUserId))
                .map(ru -> ru.getUser().getUserId())
                .distinct()
                .toList();
    }

    private Long requireSenderUserId(Long senderRoomUserId) {
        return ruRepo.findById(senderRoomUserId)
                .map(ru -> ru.getUser().getUserId())
                .orElseThrow(() -> new NotFoundException("RoomUser를 찾을 수 없습니다: roomUserId=" + senderRoomUserId));
    }

    private String summarizeForLastMessage(MessageType type, String content) {
        return switch (type) {
            case TEXT -> content;
            case POKE -> "콕 찌르기 👈";
            case CALL_START -> "통화 요청 📞";
            case CALL_ACCEPT -> "통화 수락 ✅";
            case CALL_REJECT -> "통화 거절 ❌";
        };
    }

    private ChatMessageDto saveSideEffectsAndToDto(ChatMessage saved, String lastMessageForRoom) {
        Long chatRoomId = saved.getChattingRoomId();
        Long senderRoomUserId = saved.getSenderRoomUserId();
        LocalDateTime sentAt = saved.getSentAt();

        // 1) unread
        chatUserRepo.findAllByChattingRoomChattingRoomId(chatRoomId).stream()
                .filter(cu -> !cu.getRoomUser().getRoomUserId().equals(senderRoomUserId))
                .filter(cu -> {
                    LocalDateTime lastRead = cu.getLastReadTime();
                    return lastRead == null || sentAt.isAfter(lastRead);
                })
                .forEach(cu -> chatUserRepo.save(
                        cu.toBuilder().unreadCount(cu.getUnreadCount() + 1).build()
                ));

        // 2) lastMessage/lastMessageTime
        chatRoomRepo.findById(chatRoomId).ifPresent(r ->
                chatRoomRepo.save(r.toBuilder()
                        .lastMessage(lastMessageForRoom)
                        .lastMessageTime(sentAt)
                        .build())
        );

        // 3) DTO
        return new ChatMessageDto(
                saved.getChattingRoomId(),
                saved.getSenderRoomUserId(),
                saved.getSenderUserId(),
                saved.getContent(),
                saved.getType(),
                saved.getSentAt()
        );
    }

    private ChatMessageDto toDto(ChatMessage e) {
        return new ChatMessageDto(
                e.getChattingRoomId(),
                e.getSenderRoomUserId(),
                e.getSenderUserId(),
                e.getContent(),
                e.getType(),
                e.getSentAt()
        );
    }

    private ChatRoomWithUserDto toDto(Long manitoAssignmentId, Long roomUserId) {
        ChattingRoom room = chatRoomRepo.findByManitoAssignmentManitoAssignmentId(manitoAssignmentId)
                .orElseThrow(() -> new NotFoundException("채팅방을 찾을 수 없습니다: manitoAssignmentId=" + manitoAssignmentId));

        ChattingUser cu = chatUserRepo.findByChattingRoomChattingRoomIdAndRoomUserRoomUserId(
                        room.getChattingRoomId(),
                        roomUserId)
                .orElseThrow(() -> new NotFoundException("채팅유저를 찾을 수 없습니다: roomId="
                        + room.getChattingRoomId() + ", roomUserId=" + roomUserId));

        return new ChatRoomWithUserDto(
                new ChattingRoomDto(room.getChattingRoomId(),
                        manitoAssignmentId,
                        room.getLastMessage(),
                        room.getLastMessageTime()),
                new ChattingUserDto(cu.getChattingRoom().getChattingRoomId(),
                        cu.getRoomUser().getRoomUserId(),
                        cu.getUnreadCount(),
                        cu.getLastReadTime())
        );
    }
}