package com.ssafy.ttomanito.domain.poke.service;

import com.ssafy.ttomanito.domain.manito.entity.ManitoAssignment;
import com.ssafy.ttomanito.domain.manito.repository.ManitoAssignmentRepository;
import com.ssafy.ttomanito.domain.poke.entity.PokeLog;
import com.ssafy.ttomanito.domain.poke.repository.PokeLogRepository;
import com.ssafy.ttomanito.domain.room.entity.RoomStatus;
import com.ssafy.ttomanito.domain.room.entity.RoomUser;
import com.ssafy.ttomanito.domain.room.repository.RoomUserRepository;
import com.ssafy.ttomanito.global.exception.NotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
public class PokeService {

    private final PokeLogRepository pokeRepo;
    private final RoomUserRepository roomUserRepo;
    private final ManitoAssignmentRepository manitoAssignmentRepository;

    public void poke(Long userId) {
        // 1. 현재 사용자의 RoomUser 조회
        RoomUser current = roomUserRepo
                .findActiveRoomsForUser(userId, List.of(RoomStatus.IN_PROGRESS))
                .stream()
                .findFirst()
                .orElseThrow(() -> new NotFoundException("참여 중인 방이 없습니다: userId=" + userId));

        // 2. 마니또 배정 정보 조회
        ManitoAssignment assignment = manitoAssignmentRepository
                .findByManitee_RoomUserIdAndRoom_RoomId(
                        current.getRoomUserId(),
                        current.getRoom().getRoomId()
                )
                .orElseThrow(() -> new NotFoundException("마니또 배정 정보가 없습니다: roomUserId=" + current.getRoomUserId()));

        // 3. PokeLog 저장
        pokeRepo.save(PokeLog.builder()
                .manito(assignment.getManito().getUser())
                .manitee(assignment.getManitee().getUser())
                .assignment(assignment)
                .roomUser(current)
                .createdAt(LocalDateTime.now(ZoneId.of("Asia/Seoul")))
                .build());
    }
}