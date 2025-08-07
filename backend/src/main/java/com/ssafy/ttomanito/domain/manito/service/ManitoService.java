package com.ssafy.ttomanito.domain.manito.service;

import com.ssafy.ttomanito.domain.manito.dto.ManitoGuessHistoryDto;
import com.ssafy.ttomanito.domain.manito.entity.ManitoAssignment;
import com.ssafy.ttomanito.domain.manito.entity.ManitoGuess;
import com.ssafy.ttomanito.domain.manito.repository.ManitoAssignmentRepository;
import com.ssafy.ttomanito.domain.manito.repository.ManitoGuessRepository;
import com.ssafy.ttomanito.domain.room.entity.Room;
import com.ssafy.ttomanito.domain.room.entity.RoomStatus;
import com.ssafy.ttomanito.domain.room.entity.RoomUser;
import com.ssafy.ttomanito.domain.room.repository.RoomRepository;
import com.ssafy.ttomanito.domain.room.repository.RoomUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ManitoService {
    private final RoomUserRepository roomUserRepository;
    private final ManitoAssignmentRepository manitoAssignmentRepository;
    private final ManitoGuessRepository manitoGuessRepository;
    private final RoomRepository roomRepository;

    @Transactional(readOnly = true)
    public Long getManiteeId(Long userId) {
        // 1) 현재 참여 중인 RoomUser 조회
        RoomUser currentRoomUser = roomUserRepository
                .findActiveRoomsForUser(userId, List.of(RoomStatus.NOT_STARTED, RoomStatus.IN_PROGRESS))
                .stream()
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("참여 중인 방이 없습니다."));
        Long ruId = currentRoomUser.getRoomUserId();
        Long roomId = currentRoomUser.getRoom().getRoomId();

        // 2) ManitoAssignment 조회 (manito 역할)
        return manitoAssignmentRepository
                .findByManito_RoomUserIdAndRoom_RoomId(ruId, roomId)
                .map(a -> a.getManitee().getUser().getUserId())
                .orElseThrow(() -> new IllegalStateException("마니띠가 배정되지 않았습니다."));
    }

    @Transactional
    public void guessManito(Long userId, Long guessedUserId) {
        // 1) 현재 참여 중인 RoomUser 조회
        RoomUser currentRoomUser = roomUserRepository
                .findActiveRoomsForUser(userId, List.of(RoomStatus.NOT_STARTED, RoomStatus.IN_PROGRESS))
                .stream()
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("현재 참여 중인 마니또 방이 없습니다."));
        Long ruId = currentRoomUser.getRoomUserId();
        Long roomId = currentRoomUser.getRoom().getRoomId();

        // 2) 실제 매니또(RoomUser) 조회 (현재 사용자는 manitee)
        ManitoAssignment assignment = manitoAssignmentRepository
                .findByManitee_RoomUserIdAndRoom_RoomId(ruId, roomId)
                .orElseThrow(() -> new IllegalStateException("마니또 배정 정보를 찾을 수 없습니다."));

        Long realManitoUserId = assignment.getManito().getUser().getUserId();

        // 3) 정답 여부 판단
        boolean isCorrect = realManitoUserId.equals(guessedUserId);

        // 4) 추측 기록 저장
        ManitoGuess guess = ManitoGuess.builder()
                .guessUserId(userId)
                .guessedUserId(guessedUserId)
                .guessedDate(LocalDate.now())
                .isCorrect(isCorrect)
                .build();
        manitoGuessRepository.save(guess);
    }

    @Transactional(readOnly = true)
    public List<ManitoGuessHistoryDto> getGuessHistory(Long userId) {
        List<ManitoGuess> guesses = manitoGuessRepository.findAllByGuessUserId(userId);
        return guesses.stream()
                .map(ManitoGuessHistoryDto::from)
                .toList();
    }

    @Transactional
    public void finishRoom(Long userId) {
        RoomUser roomUser = roomUserRepository
                .findActiveRoomsForUser(userId, List.of(RoomStatus.NOT_STARTED, RoomStatus.IN_PROGRESS))
                .stream()
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("참여 중인 방이 없습니다."));
        Room room = roomRepository.findByRoomIdAndCreator_UserId(roomUser.getRoom().getRoomId(), userId)
                .orElseThrow(() -> new IllegalStateException("해당 유저가 만든 방을 찾을 수 없습니다."));
        if (room.getStatus() == RoomStatus.FINISHED) return;
        room.finish(LocalDate.now());
    }
}
