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
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.concurrent.ThreadLocalRandom;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ChattingService {
    private final RoomUserRepository      ruRepo;
    private final ManitoAssignmentRepository maRepo;
    private final ChattingRoomRepository chatRoomRepo;
    private final ChattingUserRepository chatUserRepo;
    private final ChatMessageRepository   chatMsgRepo;

    @Transactional(readOnly = true)
    public ChatRoomListDto getRoomList(Long userId) {
        // --- 1) 진행 중인 방 목록 (보통 하나여야 함) ---
        List<RoomUser> active = ruRepo.findActiveRoomsForUser(
                userId,
                List.of(RoomStatus.IN_PROGRESS)
        );

        // --- 2) 마니또 방 찾기 ---
        ChatRoomWithUserDto manitoDto = active.stream()
                .map(ru -> {
                    // 해당 ru 가 ‘마니또’ 배정에 사용된 건인지 체크
                    return maRepo.findByManito_RoomUserId(ru.getRoomUserId())
                            .map(ma -> toDto(ma.getManitoAssignmentId(), ru.getRoomUserId()))
                            .orElse(null);
                })
                .filter(Objects::nonNull)
                .findFirst()
                .orElse(null);

        // --- 3) 마니띠 방 찾기 ---
        ChatRoomWithUserDto maniteeDto = active.stream()
                .map(ru -> {
                    // 해당 ru 가 ‘마니띠’ 배정에 사용된 건인지 체크
                    return maRepo.findByManitee_RoomUserId(ru.getRoomUserId())
                            .map(ma -> toDto(ma.getManitoAssignmentId(), ru.getRoomUserId()))
                            .orElse(null);
                })
                .filter(Objects::nonNull)
                .findFirst()
                .orElse(null);

        return new ChatRoomListDto(manitoDto, maniteeDto);
    }

    /**
     * 공통: manitoAssignmentId → chattingRoomId → ChattingRoom, ChattingUser 조회 후 DTO 생성
     */
    private ChatRoomWithUserDto toDto(Long manitoAssignmentId, Long roomUserId) {
        // 1) 채팅방 조회
        ChattingRoom room = chatRoomRepo
                .findByManitoAssignmentManitoAssignmentId(manitoAssignmentId)
                .orElseThrow(() -> new IllegalStateException("채팅방 없음: assignment=" + manitoAssignmentId));

        // 2) 채팅유저(내) 레코드 조회
        ChattingUser cu = chatUserRepo
                .findByChattingRoomChattingRoomIdAndRoomUserRoomUserId(
                        room.getChattingRoomId(),
                        roomUserId
                )
                .orElseThrow(() -> new IllegalStateException("채팅유저 없음: room="
                        + room.getChattingRoomId() + ", user=" + roomUserId));

        // 3) DTO 변환
        ChattingRoomDto roomDto = new ChattingRoomDto(
                room.getChattingRoomId(),
                manitoAssignmentId,
                room.getLastMessage(),
                room.getLastMessageTime()
        );
        ChattingUserDto userDto = new ChattingUserDto(
                cu.getChattingRoom().getChattingRoomId(),
                cu.getRoomUser().getRoomUserId(),
                cu.getUnreadCount(),
                cu.getLastReadTime()
        );
        return new ChatRoomWithUserDto(roomDto, userDto);
    }

    /**
     * 내가 마니또인 채팅방
     */
    @Transactional(readOnly = true)
    public ChattingRoomDto getRoomAsManito(Long userId) {
        // 1) 내가 속한 활성 RoomUser 엔티티
        RoomUser ru = ruRepo.findActiveRoomsForUser(
                        userId,
                        List.of(RoomStatus.IN_PROGRESS)
                ).stream()
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("진행 중인 방이 없습니다. userId=" + userId));

        // 2) roomUserId → ManitoAssignment
        ManitoAssignment ma = maRepo.findByManito_RoomUserId(ru.getRoomUserId())
                .orElseThrow(() -> new IllegalStateException("마니또 배정 없음. roomUserId=" + ru.getRoomUserId()));

        // 3) chatting_room 조회
        ChattingRoom room = chatRoomRepo
                .findByManitoAssignmentManitoAssignmentId(ma.getManitoAssignmentId())
                .orElseThrow(() -> new IllegalStateException("채팅방 없음. assignmentId=" + ma.getManitoAssignmentId()));

        // 4) DTO 반환
        return new ChattingRoomDto(
                room.getChattingRoomId(),
                ma.getManitoAssignmentId(),
                room.getLastMessage(),
                room.getLastMessageTime()
        );
    }

    /**
     * 내가 마니띠인 채팅방
     */
    @Transactional(readOnly = true)
    public ChattingRoomDto getRoomAsManitee(Long userId) {
        // 1) 내가 속한 활성 RoomUser
        RoomUser ru = ruRepo.findActiveRoomsForUser(
                        userId,
                        List.of(RoomStatus.IN_PROGRESS)
                ).stream()
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("진행 중인 방이 없습니다. userId=" + userId));

        // 2) roomUserId → ManitoAssignment (manitee 기준)
        ManitoAssignment ma = maRepo.findByManitee_RoomUserId(ru.getRoomUserId())
                .orElseThrow(() -> new IllegalStateException("마니띠 배정 없음 (manitee). roomUserId=" + ru.getRoomUserId()));

        // 3) chatting_room 조회
        ChattingRoom room = chatRoomRepo
                .findByManitoAssignmentManitoAssignmentId(ma.getManitoAssignmentId())
                .orElseThrow(() -> new IllegalStateException("채팅방 없음. assignmentId=" + ma.getManitoAssignmentId()));

        // 4) DTO 반환
        return new ChattingRoomDto(
                room.getChattingRoomId(),
                ma.getManitoAssignmentId(),
                room.getLastMessage(),
                room.getLastMessageTime()
        );
    }

    /**
     * 채팅 메시지 전송 (last_read_time 기반 unread_count 증가)
     */
    public ChatMessageDto saveMessage(ChatMessageDto dto) {
        // dto 에서 필요한 값을 꺼내서 기존 sendMessage 로 위임
        return sendMessage(
                dto.chattingRoomId(),
                dto.senderRoomUserId(),
                dto.content()
        );
    }

    /**
     * 랜덤 찌르기 메시지 생성 + 저장 + unread 처리 + 브로드캐스트용 반환
     */
    public ChatMessageDto pokeMessage(Long chattingRoomId, Long roomUserId) {
        // 1) 선택지 목록
        List<String> pokes = List.of(
                "뭐해",
                "콕콕",
                "어이"
        );
        // 2) 랜덤 선택
        String message = pokes.get(
                ThreadLocalRandom.current().nextInt(pokes.size())
        ) + " 🫵";

        // 3) sendMessage 로 위임
        return sendMessage(chattingRoomId, roomUserId, message);
    }

    /**
     * 메시지 보내기
     */
    public ChatMessageDto sendMessage(Long chattingRoomId, Long roomUserId, String content) {
        // 1) 메시지 저장
        ChatMessage saved = chatMsgRepo.save(
                ChatMessage.create(chattingRoomId, roomUserId, content)
        );

        LocalDateTime messageTime = saved.getSentAt();

        // 2) unreadCount 증가 — 단, 내가 아닌 상대방이 마지막으로 읽은 시간보다 이 메시지를 늦게 보냈다면
        chatUserRepo.findAllByChattingRoomChattingRoomId(chattingRoomId).stream()
                .filter(cu -> !cu.getRoomUser().getRoomUserId().equals(roomUserId))  // 내가 아닌 상대
                .filter(cu -> {
                    LocalDateTime lastRead = cu.getLastReadTime();
                    // lastRead가 null(한 번도 읽지 않음) 이거나 메시지 발송 시간 이후라면 unread 증가
                    return lastRead == null || messageTime.isAfter(lastRead);
                })
                .forEach(cu -> {
                    var upd = cu.toBuilder()
                            .unreadCount(cu.getUnreadCount() + 1)
                            .build();
                    chatUserRepo.save(upd);
                });

        // 3) 채팅방의 lastMessage, lastMessageTime 업데이트
        chatRoomRepo.findById(chattingRoomId).ifPresent(r -> {
            var upd = r.toBuilder()
                    .lastMessage(content)
                    .lastMessageTime(LocalDateTime.now())
                    .build();
            chatRoomRepo.save(upd);
        });

        // 4) DTO 응답
        return new ChatMessageDto(
                saved.getChattingRoomId(),
                saved.getSenderRoomUserId(),
                saved.getContent(),
                saved.getSentAt()
        );
    }

    /**
     * 채팅방 메시지 조회 (최대 50개)
     */
    @Transactional(readOnly = true)
    public List<ChatMessageDto> getHistory(Long chatRoomId) {
        return chatMsgRepo.findTop50ByChattingRoomIdOrderBySentAtAsc(chatRoomId).stream()
                .map(m -> new ChatMessageDto(
                        m.getChattingRoomId(),
                        m.getSenderRoomUserId(),
                        m.getContent(),
                        m.getSentAt()
                ))
                .collect(Collectors.toList());
    }

    /**
     * 채팅방 입장: 내 unread_count 0, 마지막 읽은 시간 갱신
     */
    public void markRead(Long chattingRoomId, Long userId) {
        RoomUser ru = ruRepo.findActiveRoomsForUser(
                        userId,
                        List.of(RoomStatus.IN_PROGRESS)
                ).stream()
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("진행 중인 방이 없습니다. userId=" + userId));

        chatUserRepo.findByChattingRoomChattingRoomIdAndRoomUserRoomUserId(chattingRoomId, ru.getRoomUserId())
                .ifPresent(cu -> {
                    ChattingUser updated = cu.toBuilder()
                            .unreadCount(0)
                            .lastReadTime(LocalDateTime.now())
                            .build();
                    chatUserRepo.save(updated);
                });
    }

    /**
     * 채팅방 퇴장: 마지막 메시지 동기화
     */
//    public void leaveRoom(Long chattingRoomId, Long userId) {
//        RoomUser ru = ruRepo.findActiveRoomsForUser(
//                        userId,
//                        List.of(RoomStatus.IN_PROGRESS)
//                ).stream()
//                .findFirst()
//                .orElseThrow(() -> new IllegalStateException("진행 중인 방이 없습니다. userId=" + userId));
//
//        // 1) MongoDB 최신 메시지 조회
//        chatMsgRepo.findTopByChattingRoomIdOrderBySentAtDesc(chattingRoomId).ifPresent(last -> {
//            chatRoomRepo.findById(chattingRoomId).ifPresent(room -> {
//                ChattingRoom updated = room.toBuilder()
//                        .lastMessage(last.getContent())
//                        .lastMessageTime(last.getSentAt())
//                        .build();
//                chatRoomRepo.save(updated);
//            });
//        });
//    }

    /**
     * 미확인 메시지 개수 반환
     */
//    @Transactional(readOnly = true)
//    public int getUnreadCount(Long roomId, Long roomUserId) {
//        return chatUserRepo.findByChattingRoomChattingRoomIdAndRoomUserRoomUserId(roomId, roomUserId)
//                .map(ChattingUser::getUnreadCount)
//                .orElse(0);
//    }
//
//    private ChattingRoomDto toDto(ChattingUser cu) {
//        ChattingRoom room = cu.getChattingRoom();
//        return new ChattingRoomDto(
//                room.getChattingRoomId(),
//                room.getManitoAssignment().getManitoAssignmentId(),
//                room.getLastMessage(),
//                room.getLastMessageTime()
//        );
//    }
}
