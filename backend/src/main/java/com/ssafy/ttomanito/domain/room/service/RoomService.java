package com.ssafy.ttomanito.domain.room.service;

import com.ssafy.ttomanito.domain.chatting.room.entity.ChattingRoom;
import com.ssafy.ttomanito.domain.chatting.room.repository.ChattingRoomRepository;
import com.ssafy.ttomanito.domain.chatting.user.entity.ChattingUser;
import com.ssafy.ttomanito.domain.chatting.user.repository.ChattingUserRepository;
import com.ssafy.ttomanito.domain.manito.entity.ManitoAssignment;
import com.ssafy.ttomanito.domain.manito.repository.ManitoAssignmentRepository;
import com.ssafy.ttomanito.domain.room.dto.request.CreateRoomRequest;
import com.ssafy.ttomanito.domain.room.dto.response.ParticipantResponse;
import com.ssafy.ttomanito.domain.room.dto.response.RoomInfoResponse;
import com.ssafy.ttomanito.domain.room.dto.response.WaitingMessage;
import com.ssafy.ttomanito.domain.room.entity.*;
import com.ssafy.ttomanito.domain.room.repository.MissionDayRepository;
import com.ssafy.ttomanito.domain.room.repository.RoomRepository;
import com.ssafy.ttomanito.domain.room.repository.RoomUserRepository;
import com.ssafy.ttomanito.domain.user.entity.User;
import com.ssafy.ttomanito.domain.user.repository.UserRepository;
import com.ssafy.ttomanito.global.exception.AccessDeniedException;
import com.ssafy.ttomanito.global.exception.BadRequestException;
import com.ssafy.ttomanito.global.exception.NotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;

@Slf4j
@Service
@Transactional
@RequiredArgsConstructor
public class RoomService {
    private final RoomRepository roomRepository;
    private final RoomUserRepository roomUserRepository;
    private final ChattingRoomRepository chattingRoomRepository;
    private final ChattingUserRepository chattingUserRepository;
    private final MissionDayRepository missionDayRepository;
    private final ManitoAssignmentRepository manitoAssignmentRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;


    public RoomInfoResponse createRoom(CreateRoomRequest req, Long creatorId) {
        // 1) 요청 검증
        if (req == null) {
            throw new BadRequestException("요청이 잘못되었습니다.");
        }
        if (req.name() == null || req.name().isBlank()) {
            throw new BadRequestException("방 이름은 필수입니다.");
        }
        if (req.missionDays() == null || req.missionDays().isEmpty()) {
            throw new BadRequestException("미션 요일을 하나 이상 선택하세요.");
        }

        // 2) 방장 User 로드
        User creator = userRepository.findById(creatorId)
                .orElseThrow(() -> new NotFoundException("유저를 찾을 수 없습니다: id=" + creatorId));

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
        // 1) roomId 존재 여부 확인
        if (!roomRepository.existsById(roomId)) {
            throw new NotFoundException("Room with id " + roomId + " not found");
        }

        // 2) 실제 참가자 조회
        return roomUserRepository.findParticipantsByRoomId(roomId);
    }

    public UserRoomStatus getUserRoomStatusEnum(Long userId) {
        List<RoomStatus> statuses = List.of(RoomStatus.NOT_STARTED, RoomStatus.IN_PROGRESS);
        List<RoomUser> rooms = roomUserRepository.findActiveRoomsForUser(userId, statuses);

        if (rooms.stream().anyMatch(ru -> ru.getRoom().getStatus() == RoomStatus.NOT_STARTED)) {
            return UserRoomStatus.IN_WAITING;
        }
        if (rooms.stream().anyMatch(ru -> ru.getRoom().getStatus() == RoomStatus.IN_PROGRESS)) {
            return UserRoomStatus.IN_GAME;
        }
        return UserRoomStatus.IN_NONE;
    }

    @Transactional(readOnly = true)
    public RoomInfoResponse getRoomInfo(Long roomId) {
        Room room = find(roomId);
        List<Weekday> days = missionDayRepository.findWeekdaysByRoomId(roomId);
        return RoomInfoResponse.from(room, days);
    }

    public void closeRoomByCreatorId(Long creatorId) {
        Room room = roomRepository
                .findByCreator_UserIdAndStatus(creatorId, RoomStatus.NOT_STARTED)
                .orElseThrow(() -> new NotFoundException("진행 중인 대기 방이 없습니다."));
        room.markAsNone();

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
            throw new AccessDeniedException("호스트만 참가자를 강퇴할 수 있습니다.");
        }
        roomUserRepository.deleteByRoom_roomIdAndUser_UserId(roomId, targetUserId);
        messagingTemplate.convertAndSend(
                "/topic/waiting/" + roomId,
                WaitingMessage.builder()
                        .roomId(roomId)
                        .userId(targetUserId)
                        .type(WaitingMessage.MessageType.KICK)
                        .build()
        );
    }

    @Transactional
    public void startGame(Long roomId, Long hostId) {
        log.info("[방] 게임 시작 시도 - 방ID={}, 호스트ID={}", roomId, hostId);
        Room room = find(roomId);
        if (!room.getCreator().getUserId().equals(hostId)) {
            throw new AccessDeniedException("호스트만 게임을 시작할 수 있습니다.");
        }

        // 이미 시작된 방 재시작 방지 (선택)
        if (room.getStatus() == RoomStatus.IN_PROGRESS || room.getStatus() == RoomStatus.FINISHED) {
            throw new BadRequestException("이미 시작되었거나 종료된 방입니다.");
        }

        List<RoomUser> participants = roomUserRepository.findByRoom_RoomId(roomId);
        log.debug("[방] 참가자 수 = {}", participants.size());
        if (participants.size() < 4) {
            throw new BadRequestException("최소 4명의 참가자가 필요합니다.");
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

        // 1) 마니또-마니띠 배정 (순환)
        List<ManitoAssignment> assignments = new ArrayList<>(participants.size());
        for (int i = 0; i < participants.size(); i++) {
            RoomUser manito = participants.get(i);
            RoomUser manitee = participants.get((i + 1) % participants.size());

            ManitoAssignment assignment = ManitoAssignment.create(manito, manitee, room);
            assignments.add(assignment);
        }
        manitoAssignmentRepository.saveAll(assignments);

        // 2) 매칭마다 채팅방 생성
        List<ChattingRoom> rooms = assignments.stream()
                .map(ChattingRoom::create)
                .toList();
        chattingRoomRepository.saveAll(rooms);

        // 3) 각 채팅방마다 채팅유저 2명(마니또, 마니띠) 생성
        List<ChattingUser> chattingUsers = new ArrayList<>(rooms.size() * 2);
        for (int i = 0; i < rooms.size(); i++) {
            ChattingRoom cr = rooms.get(i);
            ManitoAssignment a = assignments.get(i);

            // 마니또 유저
            chattingUsers.add(ChattingUser.create(cr, a.getManito()));
            // 마니띠 유저
            chattingUsers.add(ChattingUser.create(cr, a.getManitee()));
        }
        log.info("[방] 매칭 완료 - 매칭개수={}, 채팅방개수={}, 채팅유저개수={}",
                assignments.size(), rooms.size(), chattingUsers.size());
        log.debug("[웹소켓] 대기방 브로드캐스트 - /topic/waiting/{} (시작)", roomId);
        chattingUserRepository.saveAll(chattingUsers);
    }

    @Transactional(readOnly = true)
    public Room find(Long roomId) {
        return roomRepository.findById(roomId)
                .orElseThrow(() -> new NotFoundException("존재하지 않는 방입니다: id=" + roomId));
    }

    public boolean checkCreator(Long userId) {
        List<RoomStatus> active = List.of(RoomStatus.NOT_STARTED, RoomStatus.IN_PROGRESS);
        return roomRepository.checkCreator(userId, active);
    }
}
