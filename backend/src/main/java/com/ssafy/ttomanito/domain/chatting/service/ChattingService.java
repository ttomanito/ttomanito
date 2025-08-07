package com.ssafy.ttomanito.domain.chatting.service;

import com.ssafy.ttomanito.domain.chatting.message.dto.ChatMessageDto;
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
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Objects;
import java.util.concurrent.ThreadLocalRandom;
import java.util.stream.Collectors;

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

    public ChatMessageDto saveMessage(ChatMessageDto dto) {
        return sendMessage(dto.chattingRoomId(), dto.senderRoomUserId(), dto.content());
    }

    public ChatMessageDto pokeMessage(Long chattingRoomId, Long roomUserId) {
        List<String> pokes = List.of("뭐해", "콕콕", "어이");
        String message = pokes.get(ThreadLocalRandom.current().nextInt(pokes.size())) + " 🫵";
        return sendMessage(chattingRoomId, roomUserId, message);
    }

    public ChatMessageDto sendMessage(Long chattingRoomId, Long roomUserId, String content) {
        ChatMessage saved = chatMsgRepo.save(ChatMessage.create(chattingRoomId, roomUserId, content));
        LocalDateTime sentAt = saved.getSentAt();

        chatUserRepo.findAllByChattingRoomChattingRoomId(chattingRoomId).stream()
                .filter(cu -> !cu.getRoomUser().getRoomUserId().equals(roomUserId))
                .filter(cu -> {
                    LocalDateTime lastRead = cu.getLastReadTime();
                    return lastRead == null || sentAt.isAfter(lastRead);
                })
                .forEach(cu -> chatUserRepo.save(cu.toBuilder()
                        .unreadCount(cu.getUnreadCount() + 1)
                        .build()));

        chatRoomRepo.findById(chattingRoomId).ifPresent(r -> chatRoomRepo.save(r.toBuilder()
                .lastMessage(content)
                .lastMessageTime(LocalDateTime.now())
                .build()));

        return new ChatMessageDto(
                saved.getChattingRoomId(),
                saved.getSenderRoomUserId(),
                saved.getContent(),
                saved.getSentAt()
        );
    }

    public List<ChatMessageDto> getHistory(Long chatRoomId, LocalDateTime before) {
        List<ChatMessage> msgs;

        Pageable pg = PageRequest.of(0, 50, Sort.by("sentAt").descending());
        if (before == null) {
            // 최초: 가장 최근 50개
            msgs = chatMsgRepo.findTop50ByChattingRoomIdOrderBySentAtDesc(chatRoomId);
        } else {
            // 이전 50개
            msgs = chatMsgRepo.findByChattingRoomIdAndSentAtBefore(chatRoomId, before, pg);
        }

        if (msgs.isEmpty()) {
            return List.of();
        }

        // 화면에선 오름차순(과거→최신) 으로 보여주기 위해 뒤집기
        Collections.reverse(msgs);

        return msgs.stream()
                .map(m -> new ChatMessageDto(
                        m.getChattingRoomId(),
                        m.getSenderRoomUserId(),
                        m.getContent(),
                        m.getSentAt()
                ))
                .collect(Collectors.toList());
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
}