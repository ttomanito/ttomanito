package com.ssafy.ttomanito.domain.room.service;

import com.ssafy.ttomanito.domain.room.dto.RoomEvent;
import com.ssafy.ttomanito.domain.room.dto.RoomMessageType;
import com.ssafy.ttomanito.domain.room.dto.request.CreateRoomRequest;
import com.ssafy.ttomanito.domain.room.dto.response.ParticipantResponse;
import com.ssafy.ttomanito.domain.room.dto.response.RoomInfoResponse;
import com.ssafy.ttomanito.domain.room.model.Room;
import com.ssafy.ttomanito.domain.room.model.RoomUser;
import com.ssafy.ttomanito.domain.room.repository.RoomRepository;
import com.ssafy.ttomanito.domain.room.repository.RoomUserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.apache.coyote.BadRequestException;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class RoomService {


    private final RoomRepository roomRepository;          // JPA Repository
    private final RoomUserRepository roomUserRepository;  // JPA Repository
    private final RoomSessionRegistry registry;           // 실시간 접속자 관리(메모리)
    private final SimpMessagingTemplate messagingTemplate; // WS 브로드캐스트


    /* ---------- CRUD ---------- */

    public RoomInfoResponse createRoom(CreateRoomRequest req, Long creatorId) {
        Room room = roomRepository.save(Room.create(creatorId, req.getName()));
        // 방장 자동 참가를 원하면 주석 해제
        // roomUserRepository.save(RoomUser.of(room.getId(), creatorId));

        // 처음 상태를 바로 쏘고 싶다면
        broadcastState(room.getId());

        return RoomInfoResponse.from(room);
    }

    @Transactional(readOnly = true)
    public List<ParticipantResponse> getParticipants(Long roomId) {
        return roomUserRepository.findParticipants(roomId);
    }

    @Transactional(readOnly = true)
    public RoomInfoResponse getRoomInfo(Long roomId) {
        Room room = find(roomId);
        return RoomInfoResponse.from(room);
    }

    /* ---------- 비즈니스 ---------- */

    public void kick(Long roomId, Long targetUserId) {
        roomUserRepository.deleteByRoomIdAndUserId(roomId, targetUserId);
        broadcast(roomId, RoomMessageType.KICK, targetUserId);
        broadcastState(roomId);
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
    public void startGame(Long roomId) {
        Room room = find(roomId);
        room.start(LocalDate.now());   // status = IN_PROGRESS, startDate 세팅
        roomRepository.save(room);

        broadcast(roomId, RoomMessageType.START, null);
        broadcastState(roomId);
    }

    public void enterByHttp(Long roomId, Long userId) {
        roomUserRepository.findByRoomIdAndUserId(roomId, userId)
                .orElseGet(() -> roomUserRepository.save(RoomUser.of(roomId, userId)));

        broadcast(roomId, RoomMessageType.ENTER, userId);
        broadcastState(roomId);
    }

    public void exitByHttp(Long roomId, Long userId) {
        roomUserRepository.deleteByRoomIdAndUserId(roomId, userId);
        broadcast(roomId, RoomMessageType.EXIT, userId);
        broadcastState(roomId);
    }

    /* ---------- private ---------- */

    private Room find(Long roomId) {
        return roomRepository.findById(roomId)
                .orElseThrow(() -> new EntityNotFoundException("room not found: " + roomId));
    }

    private void broadcast(Long roomId, RoomMessageType type, Long userId) {
        List<Long> members = registry.members(roomId);
        messagingTemplate.convertAndSend("/topic/room/" + roomId,
                RoomEvent.of(type, roomId, userId, members));
    }

    private void broadcastState(Long roomId) {
        List<Long> members = registry.members(roomId);
        messagingTemplate.convertAndSend("/topic/room/" + roomId,
                RoomEvent.state(roomId, members));
    }
}
