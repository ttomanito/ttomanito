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
import com.ssafy.ttomanito.global.exception.BadRequestException;
import com.ssafy.ttomanito.global.exception.NotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
public class ManitoService {
    private final RoomUserRepository roomUserRepository;
    private final ManitoAssignmentRepository manitoAssignmentRepository;
    private final ManitoGuessRepository manitoGuessRepository;
    private final RoomRepository roomRepository;
    private final ActivityAggregationService activityAggregationService;

    @Transactional(readOnly = true)
    public Long getManiteeId(Long userId) {
        RoomUser current = roomUserRepository
                .findActiveRoomsForUser(userId, List.of(RoomStatus.NOT_STARTED, RoomStatus.IN_PROGRESS))
                .stream().findFirst()
                .orElseThrow(() -> new NotFoundException("참여 중인 방이 없습니다"));

        ManitoAssignment asg = manitoAssignmentRepository
                .findByManito_RoomUserIdAndRoom_RoomId(current.getRoomUserId(), current.getRoom().getRoomId())
                .orElseThrow(() -> new NotFoundException("마니띠가 배정되지 않았습니다"));

        return asg.getManitee().getUser().getUserId();
    }

    public void guessManito(Long userId, Long guessedUserId) {
        RoomUser current = roomUserRepository
                .findActiveRoomsForUser(userId, List.of(RoomStatus.NOT_STARTED, RoomStatus.IN_PROGRESS))
                .stream().findFirst()
                .orElseThrow(() -> new BadRequestException("현재 참여 중인 마니또 방이 없습니다"));

        ManitoAssignment asg = manitoAssignmentRepository
                .findByManitee_RoomUserIdAndRoom_RoomId(current.getRoomUserId(), current.getRoom().getRoomId())
                .orElseThrow(() -> new NotFoundException("마니또 배정 정보를 찾을 수 없습니다"));

        Long real = asg.getManito().getUser().getUserId();
        boolean correct = real.equals(guessedUserId);

        ManitoGuess guess = ManitoGuess.builder()
                .guessUserId(userId)
                .guessedUserId(guessedUserId)
                .guessedDate(LocalDate.now())
                .isCorrect(correct)
                .build();
        manitoGuessRepository.save(guess);
    }

    @Transactional(readOnly = true)
    public List<ManitoGuessHistoryDto> getGuessHistory(Long userId) {
        return manitoGuessRepository.findAllByGuessUserId(userId).stream()
                .map(ManitoGuessHistoryDto::from)
                .toList();
    }

    public void finishRoom(Long userId) {
        RoomUser current = roomUserRepository
                .findActiveRoomsForUser(userId, List.of(RoomStatus.NOT_STARTED, RoomStatus.IN_PROGRESS))
                .stream().findFirst()
                .orElseThrow(() -> new BadRequestException("참여 중인 방이 없습니다"));

        Room room = roomRepository
                .findByRoomIdAndCreator_UserId(current.getRoom().getRoomId(), userId)
                .orElseThrow(() -> new NotFoundException("해당 유저가 만든 방을 찾을 수 없습니다"));

        if (room.getStatus() == RoomStatus.FINISHED) {
            throw new BadRequestException("이미 종료된 방입니다");
        }

        // 1) 종료 처리 (오늘 날짜로 종료)
        LocalDate todayKst = LocalDate.now(java.time.ZoneId.of("Asia/Seoul"));
        room.finish(todayKst);

        // 2) 오늘자 활동을 '해당 방'에 한해 즉시 집계
        activityAggregationService.aggregateForDateAndRoom(todayKst, room.getRoomId());
    }
}
