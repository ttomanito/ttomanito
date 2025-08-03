package com.ssafy.ttomanito.domain.manito.service;

import com.ssafy.ttomanito.domain.manito.dto.ManitoGuessHistoryDto;
import com.ssafy.ttomanito.domain.manito.entity.ManitoAssignment;
import com.ssafy.ttomanito.domain.manito.entity.ManitoGuess;
import com.ssafy.ttomanito.domain.manito.repository.ManitoAssignmentRepository;
import com.ssafy.ttomanito.domain.manito.repository.ManitoGuessRepository;
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

    @Transactional(readOnly = true)
    public Long getManiteeId(Long userId) {
        // 현재 참여 중인 RoomUser
        RoomUser roomUser = roomUserRepository
                .findActiveRoomsForUser(userId, List.of(RoomStatus.NOT_STARTED, RoomStatus.IN_PROGRESS))
                .stream()
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("참여 중인 방이 없습니다."));

        return manitoAssignmentRepository.findByManitoIdAndRoomId(userId, roomUser.getRoomId())
                .map(ManitoAssignment::getManiteeId)
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
        Long roomId = roomUser.getRoomId();

        // 2. 실제 마니또 ID 가져오기
        ManitoAssignment assignment = manitoAssignmentRepository.findByManitoIdAndRoomId(userId, roomId)
                .orElseThrow(() -> new IllegalStateException("마니또 배정 정보를 찾을 수 없습니다."));

        Long realManitoId = assignment.getManitoId();

        // 3. 맞췄는지 여부 판단
//        boolean isCorrect = realManitoId.equals(guessedUserId);
        boolean isCorrect = manitoAssignmentRepository
                .existsByManiteeIdAndManitoIdAndRoomId(userId, guessedUserId, roomId);

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
}
