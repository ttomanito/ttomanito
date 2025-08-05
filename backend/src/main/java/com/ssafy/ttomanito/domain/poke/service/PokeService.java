package com.ssafy.ttomanito.domain.poke.service;

import com.ssafy.ttomanito.domain.manito.entity.ManitoAssignment;
import com.ssafy.ttomanito.domain.manito.repository.ManitoAssignmentRepository;
import com.ssafy.ttomanito.domain.poke.entity.PokeLog;
import com.ssafy.ttomanito.domain.poke.repository.PokeLogRepository;

import com.ssafy.ttomanito.domain.room.entity.RoomUser;
import com.ssafy.ttomanito.domain.room.repository.RoomUserRepository;
import com.ssafy.ttomanito.domain.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class PokeService {

    private final PokeLogRepository pokeRepo;
    private final RoomUserRepository roomUserRepo;
    //    private final ManitoActivityService activityService;
    private final ManitoAssignmentRepository manitoAssignmentRepository;

    @Transactional
    public void poke(Long userId) {
        // 1. 활성 RoomUser 조회
        RoomUser roomUser = roomUserRepo.findActiveRoomUserByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("RoomUser 없음"));
        // 2. 마니또 배정 정보 조회
        ManitoAssignment assignment =manitoAssignmentRepository
                .findActiveAssignmentByManiteeUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("마니또 배정 정보 없음"));

        // 3. 마니띠, 마니또 설정
        User manitee = assignment.getManitee(); // = 나
        User manito = assignment.getManito();   // = 상대

        // 3. 저장
        pokeRepo.save(PokeLog.builder()
                .manito(manito)
                .manitee(manitee)
                .assignment(assignment) // 안 써도 된다면 제거 가능
                .createdAt(LocalDateTime.now())
                .roomUser(roomUser)
                .build());
    }


}