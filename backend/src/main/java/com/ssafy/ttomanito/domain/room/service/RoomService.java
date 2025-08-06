package com.ssafy.ttomanito.domain.room.service;

import com.ssafy.ttomanito.domain.manito.entity.ManitoAssignment;
import com.ssafy.ttomanito.domain.manito.repository.ManitoAssignmentRepository;
import com.ssafy.ttomanito.domain.room.dto.request.CreateRoomRequest;
import com.ssafy.ttomanito.domain.room.dto.response.ParticipantResponse;
import com.ssafy.ttomanito.domain.room.dto.response.RoomInfoResponse;
import com.ssafy.ttomanito.domain.room.dto.response.WaitingMessage;
import com.ssafy.ttomanito.domain.room.entity.MissionDay;
import com.ssafy.ttomanito.domain.room.entity.Room;
import com.ssafy.ttomanito.domain.room.entity.RoomStatus;
import com.ssafy.ttomanito.domain.room.entity.RoomUser;
import com.ssafy.ttomanito.domain.room.entity.Weekday;
import com.ssafy.ttomanito.domain.room.repository.MissionDayRepository;
import com.ssafy.ttomanito.domain.room.repository.RoomRepository;
import com.ssafy.ttomanito.domain.room.repository.RoomUserRepository;
import com.ssafy.ttomanito.domain.user.entity.User;
import com.ssafy.ttomanito.domain.user.exception.UserNotFoundException;
import com.ssafy.ttomanito.domain.user.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;

@Service
@RequiredArgsConstructor
@Transactional
public class RoomService {

    private final RoomRepository roomRepository;
    private final RoomUserRepository roomUserRepository;
    private final MissionDayRepository missionDayRepository;
    private final ManitoAssignmentRepository manitoAssignmentRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    /* ---------- CRUD ---------- */

    public RoomInfoResponse createRoom(CreateRoomRequest req, Long creatorId) {
        // 1) 요청 검증
        if (req == null) throw new IllegalArgumentException("요청이 잘못되었습니다.");
        if (req.name() == null || req.name().isBlank())
            throw new IllegalArgumentException("방 이름은 필수입니다.");
        if (req.missionDays() == null || req.missionDays().isEmpty())
            throw new IllegalArgumentException("미션 요일을 하나 이상 선택하세요.");

        // 2) 방장 User 로드
        User creator = userRepository.findById(creatorId)
                .orElseThrow(() -> new UserNotFoundException(creatorId));

        // 3) Room 생성 및 저장
        Room room = Room.create(creator, req.name())
                .toBuilder()
                .endDate(req.deadline())
                .build();
        room = roomRepository.save(room);

        // 4) MissionDay 저장 (중복 제거)
        Set<Weekday> uniqueDays = new LinkedHashSet<>(req.missionDays());
        for (Weekday day : uniqueDays) {
            missionDayRepository.save(MissionDay.of(room, day));
        }

        // 5) 방장도 RoomUser에 추가
        roomUserRepository.save(RoomUser.of(room, creator));

        // 6) 응답 반환
        return RoomInfoResponse.from(room, new ArrayList<>(uniqueDays));
    }

    @Transactional(readOnly = true)
    public List<ParticipantResponse> getParticipants(Long roomId) {
        return roomUserRepository.findParticipantsByRoomId(roomId);
    }

    @Transactional(readOnly = true)
    public RoomInfoResponse getRoomInfo(Long roomId) {
        Room room = find(roomId);
        List<Weekday> days = missionDayRepository.findWeekdaysByRoomId(roomId);
        return RoomInfoResponse.from(room, days);
    }

    /* ---------- 비즈니스 ---------- */

    public boolean isUserInProgressOrWaiting(Long userId) {
        List<RoomStatus> statuses = List.of(RoomStatus.NOT_STARTED, RoomStatus.IN_PROGRESS);
        return !roomUserRepository.findActiveRoomsForUser(userId, statuses).isEmpty();
    }

    public void setUserMessage(Long roomId, Long userId, String message) {
        if (message == null || message.isBlank()) {
            throw new IllegalArgumentException("메시지는 비어있을 수 없습니다.");
        }
        RoomUser ru = roomUserRepository
                .findByRoom_roomIdAndUser_UserId(roomId, userId)
                .orElseThrow(() -> new EntityNotFoundException("방에 참여하지 않은 사용자입니다."));
        ru = ru.toBuilder()
                .statusMessage(message)
                .build();
        roomUserRepository.save(ru);
    }

    
    public void closeRoomByCreatorId(Long creatorId) {
        Room room = roomRepository
                .findByCreator_UserIdAndStatus(creatorId, RoomStatus.NOT_STARTED)
                .orElseThrow(() -> new RuntimeException("진행 중인 대기 방이 없습니다."));
        room.markAsNone();  // Dirty Checking

        messagingTemplate.convertAndSend(
                "/topic/waiting/" + room.getRoomId(),
                WaitingMessage.builder()
                        .roomId(room.getRoomId())
                        .type(WaitingMessage.MessageType.CLOSE)
                        .build()
        );
    }
    

    public void kick(Long roomId, Long hostId, Long targetUserId) {
        Room room = find(roomId);
        if (!room.getCreator().getUserId().equals(hostId)) {
            throw new RuntimeException("호스트만 참가자를 강퇴할 수 있습니다.");
        }
        roomUserRepository.deleteByRoom_roomIdAndUser_UserId(roomId, targetUserId);
        messagingTemplate.convertAndSend(
                "/topic/waiting/" + roomId,
                WaitingMessage.builder()
                        .roomId(roomId)
                        .userId(targetUserId)
                        .type(WaitingMessage.MessageType.EXIT)
                        .build()
        );
    }

    public void startGame(Long roomId, Long hostId) {
        Room room = find(roomId);
        if (!room.getCreator().getUserId().equals(hostId)) {
            throw new RuntimeException("호스트만 게임을 시작할 수 있습니다.");
        }
        // 룸유저 엔티티를 모두 가져와서 랜덤 섞기
        List<RoomUser> participants = roomUserRepository.findByRoom_RoomId(roomId);
        if (participants.size() < 4) {
            throw new RuntimeException("최소 4명의 참가자가 필요합니다.");
        }
        Collections.shuffle(participants);

        // 게임 시작 브로드캐스트
        messagingTemplate.convertAndSend(
                "/topic/waiting/" + roomId,
                WaitingMessage.builder()
                        .roomId(roomId)
                        .type(WaitingMessage.MessageType.START)
                        .build()
        );
        room.start(LocalDate.now());

        // 매니또 할당 (순환 교대 방식)
        for (int i = 0; i < participants.size(); i++) {
            RoomUser manito = participants.get(i);
            RoomUser manitee = participants.get((i + 1) % participants.size());
            manitoAssignmentRepository.save(
                    ManitoAssignment.create(manito, manitee, room)
            );
        }
    }

    @Transactional(readOnly = true)
    public Room find(Long roomId) {
        return roomRepository.findById(roomId)
                .orElseThrow(() -> new EntityNotFoundException("존재하지 않는 방입니다: " + roomId));
    }

    public boolean isRoomNotStarted(Long roomId) {
        return find(roomId).getStatus() == RoomStatus.NOT_STARTED;
    }

    public boolean checkCreator(Long userId) {
        List<RoomStatus> active = List.of(RoomStatus.NOT_STARTED, RoomStatus.IN_PROGRESS);
        return roomRepository.checkCreator(userId, active);
    }
}
