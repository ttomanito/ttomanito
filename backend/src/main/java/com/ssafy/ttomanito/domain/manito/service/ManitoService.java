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
        // 현재 참여 중인 RoomUser
        RoomUser roomUser = roomUserRepository
                .findActiveRoomsForUser(userId, List.of(RoomStatus.NOT_STARTED, RoomStatus.IN_PROGRESS))
                .stream()
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("참여 중인 방이 없습니다."));

        return manitoAssignmentRepository
                .findByManito_UserIdAndRoom_RoomId(
                        userId,                            // manito
                        roomUser.getRoom().getRoomId())    // room
                .map(a -> a.getManitee().getUserId())      // ⭐ manitee 객체 → PK
                .orElseThrow(() -> new IllegalStateException("마니띠가 배정되지 않았습니다."));
    }
    @Transactional
    public void guessManito(Long userId, Long guessedUserId) {
        // 1. 현재 참여 중인 방의 RoomUser 가져오기
        List<RoomUser> activeRooms = roomUserRepository.findActiveRoomsForUser(
                userId, List.of(RoomStatus.NOT_STARTED, RoomStatus.IN_PROGRESS)
        );
        if (activeRooms.isEmpty()) {
            throw new IllegalStateException("현재 참여 중인 마니또 방이 없습니다.");
        }

        RoomUser roomUser = activeRooms.get(0); // 하나만 있다고 가정
        Long roomId = roomUser.getRoom().getRoomId();

        // 2. 실제 마니또 ID 가져오기
        ManitoAssignment assignment = manitoAssignmentRepository.findByManito_UserIdAndRoom_RoomId(userId, roomId)
                .orElseThrow(() -> new IllegalStateException("마니또 배정 정보를 찾을 수 없습니다."));

        Long realManitoId = assignment.getManito().getUserId();

        // 3. 맞췄는지 여부 판단
//        boolean isCorrect = realManitoId.equals(guessedUserId);
        boolean isCorrect = manitoAssignmentRepository
                .existsByManitee_UserIdAndManito_UserIdAndRoom_RoomId(userId, guessedUserId, roomId);

        // 4. 추측 저장
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
        // 1. 유저가 만든 방 찾기
        RoomUser roomUser = roomUserRepository
                .findActiveRoomsForUser(userId, List.of(RoomStatus.NOT_STARTED, RoomStatus.IN_PROGRESS))
                .stream()
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("참여 중인 방이 없습니다."));

        Room room = roomRepository.findByRoomIdAndCreator_UserId(roomUser.getRoom().getRoomId(), userId)
                .orElseThrow(() -> new IllegalStateException("해당 유저가 만든 방을 찾을 수 없습니다."));

        // 2. 이미 종료된 방은 무시
        if (room.getStatus() == RoomStatus.FINISHED) {
            return;
        }

        // 3. 종료 조건 확인 (종료일이 지났거나 사용자가 직접 종료)
        if (room.getEndDate() != null && !room.getEndDate().isAfter(LocalDate.now())) {
            room.finish(LocalDate.now()); // 내부에서 status = FINISHED로 바꾸는 메서드
        } else {
            // 사용자가 수동으로 종료했을 경우에도 강제로 종료
            room.finish(LocalDate.now());
        }
    }
}
