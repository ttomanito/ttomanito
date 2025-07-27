package com.ssafy.ttomanito.domain.room.service;

import com.ssafy.ttomanito.domain.room.dto.RoomEvent;
import com.ssafy.ttomanito.domain.room.dto.RoomMessageType;
import com.ssafy.ttomanito.domain.room.dto.request.CreateRoomRequest;
import com.ssafy.ttomanito.domain.room.dto.response.ParticipantResponse;
import com.ssafy.ttomanito.domain.room.dto.response.RoomInfoResponse;
import com.ssafy.ttomanito.domain.room.entity.MissionDay;
import com.ssafy.ttomanito.domain.room.entity.Room;
import com.ssafy.ttomanito.domain.room.entity.RoomUser;
import com.ssafy.ttomanito.domain.room.entity.Weekday;
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

@Service
@RequiredArgsConstructor
@Transactional
public class RoomService {


    private final RoomRepository roomRepository;          // JPA Repository
    private final RoomUserRepository roomUserRepository;  // JPA Repository
    private final SimpMessagingTemplate messagingTemplate; // WS 브로드캐스트
    private final MissionDayRepository missionDayRepository;

    /* ---------- CRUD ---------- */

    @Transactional
    public RoomInfoResponse createRoom(CreateRoomRequest req, Long creatorId) {
        if (req == null) throw new IllegalArgumentException("request is null");
        if (req.name() == null || req.name().isBlank())
            throw new IllegalArgumentException("name is required");
        if (req.missionDays() == null || req.missionDays().isEmpty())
            throw new IllegalArgumentException("missionDays must not be empty");

        Room room = Room.create(creatorId, req.name());
        room.setEndDate(req.deadline());
        room = roomRepository.save(room);
        System.out.println("saved room id = " + room.getId());
        // ✅ mission_day 저장
        var uniqueDays = new LinkedHashSet<>(req.missionDays());
        for (Weekday day : uniqueDays) {

            missionDayRepository.save(MissionDay.of(room.getId(), day));
        }

        List<Weekday> days = new ArrayList<>(uniqueDays);
        return RoomInfoResponse.from(room, days);
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
    /* ---------- private ---------- */

    private Room find(Long roomId) {
        return roomRepository.findById(roomId)
                .orElseThrow(() -> new EntityNotFoundException("room not found: " + roomId));
    }


}
