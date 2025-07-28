package com.ssafy.ttomanito.domain.room.service;

import com.ssafy.ttomanito.domain.manito.repository.ManitoAssignmentRepository;
import com.ssafy.ttomanito.domain.manito.entity.ManitoAssignment;
import com.ssafy.ttomanito.domain.room.dto.request.CreateRoomRequest;
import com.ssafy.ttomanito.domain.room.dto.response.ParticipantResponse;
import com.ssafy.ttomanito.domain.room.dto.response.RoomInfoResponse;
import com.ssafy.ttomanito.domain.room.dto.response.WaitingMessage;
import com.ssafy.ttomanito.domain.room.entity.*;
import com.ssafy.ttomanito.domain.room.repository.MissionDayRepository;
import com.ssafy.ttomanito.domain.room.repository.RoomRepository;
import com.ssafy.ttomanito.domain.room.repository.RoomUserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.apache.coyote.BadRequestException;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Transactional
public class RoomService {


    private final RoomRepository roomRepository;          // JPA Repository
    private final RoomUserRepository roomUserRepository;  // JPA Repository
    private final SimpMessagingTemplate messagingTemplate; // WS 브로드캐스트
    private final MissionDayRepository missionDayRepository;
    private final ManitoAssignmentRepository manitoAssignmentRepository;

    /* ---------- CRUD ---------- */

    @Transactional
    public RoomInfoResponse createRoom(CreateRoomRequest req, Long creatorId) {

        // 1. 유효성 검증
        if (req == null) throw new IllegalArgumentException("request is null");
        if (req.name() == null || req.name().isBlank())
            throw new IllegalArgumentException("name is required");
        if (req.missionDays() == null || req.missionDays().isEmpty())
            throw new IllegalArgumentException("missionDays must not be empty");

        // 2. Room 생성 및 저장
        Room room = Room.create(creatorId, req.name());
        room.setEndDate(req.deadline());
        room = roomRepository.save(room);

        // 3. 미션 요일 저장 (중복 제거)
        Set<Weekday> uniqueDays = new LinkedHashSet<>(req.missionDays());
        for (Weekday day : uniqueDays) {
            missionDayRepository.save(MissionDay.of(room.getId(), day));
        }

        // 4. 방장도 room_user에 추가
        RoomUser roomUser = RoomUser.of(room.getId(), creatorId);
        roomUserRepository.save(roomUser); // 이 라인 빠져있었음

        // 5. 응답 반환
        return RoomInfoResponse.from(room, new ArrayList<>(uniqueDays));
    }

    @Transactional(readOnly = true)
    public List<ParticipantResponse> getParticipants(Long roomId) {
        return roomUserRepository.findParticipants(roomId);
    }

    @Transactional(readOnly = true)
    public RoomInfoResponse getRoomInfo(Long roomId) {
        Room room = find(roomId);
        List<Weekday> days = missionDayRepository.findWeekdaysByRoomId(roomId);
        return RoomInfoResponse.from(room, days);
    }

    /* ---------- 비즈니스 ---------- */

/*    public void kick(Long roomId, Long targetUserId) {
        roomUserRepository.deleteByRoomIdAndUserId(roomId, targetUserId);
        broadcast(roomId, RoomMessageType.KICK, targetUserId);
        broadcastState(roomId);
    }*/
// 사용자가 참여 중인 게임(방)에 참여 중인지 확인하는 메서드

public boolean isUserInProgressOrWaiting(Long userId) {
// 사용자가 `NOT_STARTED` 또는 `IN_PROGRESS` 상태의 방에 참여 중인지 확인
    List<RoomStatus> statuses = List.of(RoomStatus.NOT_STARTED, RoomStatus.IN_PROGRESS);
    List<RoomUser> activeRooms = roomUserRepository.findActiveRoomsForUser(userId, statuses);

    // 상태가 `NOT_STARTED` 또는 `IN_PROGRESS`인 방에 사용자가 참여 중이면 true 반환
    return !activeRooms.isEmpty();  // 참여 중인 방이 하나라도 있으면 true
}
    public void setUserMessage(Long roomId, Long userId, String message) throws BadRequestException {
        if (message == null || message.isBlank()) {
            throw new BadRequestException("message must not be blank");
        }
        RoomUser ru = roomUserRepository.findByRoomIdAndUserId(roomId, userId)
                .orElseThrow(() -> new EntityNotFoundException("not joined"));

        ru.setStatusMessage(message);
        // 필요시 broadcastState(roomId);
    }
  /*  public void startGame(Long roomId) {
        Room room = find(roomId);
        room.start(LocalDate.now());   // status = IN_PROGRESS, startDate 세팅
        roomRepository.save(room);

        broadcast(roomId, RoomMessageType.START, null);
        broadcastState(roomId);
    }

    public void enterByHttp(Long roomId, Long userId) {
        roomUserRepository.deleteByRoomIdAndUserId(roomId, userId);
        broadcast(roomId, RoomMessageType.EXIT, userId);
        broadcastState(roomId);
    }

    public void exitByHttp(Long roomId, Long userId) {
        roomUserRepository.deleteByRoomIdAndUserId(roomId, userId);
        broadcast(roomId, RoomMessageType.EXIT, userId);
        broadcastState(roomId);
    }
*/
  @Transactional
  public void closeRoomByCreatorId(Long creatorId) {
      // 해당 사용자가 만든 NOT_STARTED 상태 방을 찾아서 종료
      Room room = roomRepository.findByCreatorIdAndStatus(creatorId, RoomStatus.NOT_STARTED)
              .orElseThrow(() -> new RuntimeException("진행 중인 대기방이 없습니다."));

      room.markAsNone(); // 상태 변경

  }
    /* ---------- private ---------- */

    private Room find(Long roomId) {
        return roomRepository.findById(roomId)
                .orElseThrow(() -> new EntityNotFoundException("room not found: " + roomId));
    }
    // ID로 Room 조회 + 없으면 예외
    public Room findById(Long roomId) {
        return roomRepository.findById(roomId)
                .orElseThrow(() -> new RuntimeException("존재하지 않는 방입니다. roomId: " + roomId));
    }

    // 필요하면 상태 체크만 따로 메서드로 빼도 됨
    public boolean isRoomNotStarted(Long roomId) {
        Room room = findById(roomId);
        return room.getStatus() == RoomStatus.NOT_STARTED;
    }

    @Transactional
    public void kick(Long roomId, Long hostId, Long targetUserId) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new RuntimeException("Room not found"));

        if (!room.getCreatorId().equals(hostId)) {
            throw new RuntimeException("Only host can kick participants.");
        }

        roomUserRepository.deleteByRoomIdAndUserId(roomId, targetUserId);

        // 브로드캐스트
        messagingTemplate.convertAndSend("/topic/waiting/" + roomId,
                WaitingMessage.builder()
                        .roomId(roomId)
                        .userId(targetUserId)
                        .type(WaitingMessage.MessageType.EXIT)
                        .build());
    }

    @Transactional
    public void startGame(Long roomId, Long hostId) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new RuntimeException("Room not found"));

        // ✅ 방장 확인
        if (!room.getCreatorId().equals(hostId)) {
            throw new RuntimeException("Only host can start the game.");
        }

        // ✅ 참여자 조회
        List<Long> participantIds = roomUserRepository.findUserIdsByRoomId(roomId);
        if (participantIds.size() < 2) {
            throw new RuntimeException("At least 2 participants required to start.");
        }

        // ✅ 방 상태 변경
        room.start(LocalDate.now());
        roomRepository.save(room);

        // ✅ 마니또 매칭 (순환 구조)
        for (int i = 0; i < participantIds.size(); i++) {
            Long manitoId = participantIds.get(i);
            Long maniteeId = participantIds.get((i + 1) % participantIds.size());

            ManitoAssignment assignment = ManitoAssignment.create(manitoId, maniteeId, roomId);
            manitoAssignmentRepository.save(assignment);
        }
    }


}
