package com.ssafy.ttomanito.domain.mission.service;

import com.ssafy.ttomanito.domain.mission.dto.MissionResponseDto;
import com.ssafy.ttomanito.domain.mission.entity.DailyMission;
import com.ssafy.ttomanito.domain.mission.entity.Mission;
import com.ssafy.ttomanito.domain.mission.entity.MissionStatus;
import com.ssafy.ttomanito.domain.mission.repository.DailyMissionRepository;
import com.ssafy.ttomanito.domain.mission.repository.MissionRepository;
import com.ssafy.ttomanito.domain.mission.repository.MissionStatusRepository;
import com.ssafy.ttomanito.domain.room.entity.RoomStatus;
import com.ssafy.ttomanito.domain.room.entity.RoomUser;
import com.ssafy.ttomanito.domain.room.repository.RoomUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MissionService {

    private final RoomUserRepository roomUserRepository;
    private final MissionRepository missionRepository;
    private final DailyMissionRepository dailyMissionRepository;
    private final MissionStatusRepository missionStatusRepository;

    @Transactional
    public MissionResponseDto getTodayMission(Long userId) {
        // 1. 참여 중인 방 상태 (NOT_STARTED, IN_PROGRESS) 중 하나인 방의 RoomUser 가져오기
        List<RoomUser> activeRooms = roomUserRepository.findActiveRoomsForUser(userId, List.of(RoomStatus.NOT_STARTED, RoomStatus.IN_PROGRESS));

        if (activeRooms.isEmpty()) {
            throw new IllegalStateException("현재 참여 중인 마니또 방이 없습니다.");
        }

        RoomUser roomUser = activeRooms.get(0);  // 하나만 있다고 가정

        LocalDate today = LocalDate.now();

        // 2. 이미 오늘 미션이 있으면 반환
        Optional<DailyMission> existing = dailyMissionRepository.findByManitoAndMissionDate(roomUser, today);
        if (existing.isPresent()) {
            DailyMission dm = existing.get();
            boolean completed = missionStatusRepository
                    .findByRoomUserAndDailyMission(roomUser, dm)
                    .map(MissionStatus::isCompleted)
                    .orElse(false);
            Mission m = dm.getMission();
            return new MissionResponseDto(m.getId(), m.getTitle(), m.getDescription(), m.getDifficulty(), m.getChannel(), completed);
        }

        // 3. 현재 방에서 받은 미션 ID 목록
        List<DailyMission> pastMissions = dailyMissionRepository
                .findAllByManitoRoomIdAndManitoUserId(roomUser.getRoomId(), roomUser.getUserId());

        Set<Long> pastMissionIds = pastMissions.stream()
                .map(dm -> dm.getMission().getId())
                .collect(Collectors.toSet());

        // 4. 전체 미션 중 아직 안 받은 것 필터링
        List<Mission> availableMissions = missionRepository.findAll().stream()
                .filter(m -> !pastMissionIds.contains(m.getId()))
                .toList();

        if (availableMissions.isEmpty()) {
            throw new IllegalStateException("줄 수 있는 새로운 미션이 없습니다.");
        }

        // 5. 랜덤 미션 생성 및 저장
        Mission selected = availableMissions.get(new Random().nextInt(availableMissions.size()));
        DailyMission newDaily = DailyMission.builder()
                .manito(roomUser)
                .mission(selected)
                .missionDate(today)
                .build();
        dailyMissionRepository.save(newDaily);

        MissionStatus status = MissionStatus.builder()
                .roomUser(roomUser)
                .dailyMission(newDaily)
                .completed(false)
                .build();
        missionStatusRepository.save(status);

        return new MissionResponseDto(
                selected.getId(),
                selected.getTitle(),
                selected.getDescription(),
                selected.getDifficulty(),
                selected.getChannel(),
                false
        );
    }
}
