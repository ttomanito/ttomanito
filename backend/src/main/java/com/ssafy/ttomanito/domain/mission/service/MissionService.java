package com.ssafy.ttomanito.domain.mission.service;

import com.ssafy.ttomanito.domain.mission.dto.MissionListItemDto;
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
        List<RoomUser> activeRooms = roomUserRepository.findActiveRoomsForUser(userId, List.of(RoomStatus.NOT_STARTED, RoomStatus.IN_PROGRESS));

        if (activeRooms.isEmpty()) {
            throw new IllegalStateException("현재 참여 중인 마니또 방이 없습니다.");
        }

        RoomUser roomUser = activeRooms.get(0);
        LocalDate today = LocalDate.now();

        // 1. 이미 오늘 미션이 있으면
        Optional<DailyMission> existing = dailyMissionRepository.findByManitoAndMissionDate(roomUser, today);
        if (existing.isPresent()) {
            DailyMission dm = existing.get();
            List<MissionStatus> statusList = missionStatusRepository.findByRoomUserAndDailyMission(roomUser, dm);
            boolean completed = statusList.stream().anyMatch(MissionStatus::isCompleted);
            Long missionStatusId = statusList.stream().findFirst().map(MissionStatus::getId).orElse(null);

            Mission m = dm.getMission();
            return new MissionResponseDto(
                    m.getId(),
                    m.getTitle(),
                    m.getDescription(),
                    m.getDifficulty(),
                    m.getChannel(),
                    completed,
                    missionStatusId
            );
        }

        // 2. 새로운 미션 부여
        List<DailyMission> pastMissions = dailyMissionRepository
                .findAllByManitoRoomIdAndManitoUserId(roomUser.getRoomId(), roomUser.getUserId());

        Set<Long> pastMissionIds = pastMissions.stream()
                .map(dm -> dm.getMission().getId())
                .collect(Collectors.toSet());

        List<Mission> availableMissions = missionRepository.findAll().stream()
                .filter(m -> !pastMissionIds.contains(m.getId()))
                .toList();

        if (availableMissions.isEmpty()) {
            throw new IllegalStateException("줄 수 있는 새로운 미션이 없습니다.");
        }

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
                false,
                status.getId()  // ✅ 생성한 status의 ID도 같이 반환
        );
    }


    @Transactional(readOnly = true)
    public List<MissionListItemDto> getMyMissionList(Long userId) {
        System.out.println("== userId: " + userId);
        List<RoomUser> activeRooms = roomUserRepository.findActiveRoomsForUser(
                userId, List.of(RoomStatus.NOT_STARTED, RoomStatus.IN_PROGRESS)
        );
        System.out.println("== activeRooms: " + activeRooms.size());
        if (activeRooms.isEmpty()) {
            throw new IllegalStateException("현재 참여 중인 마니또 방이 없습니다.");
        }

        RoomUser roomUser = activeRooms.get(0);

        List<DailyMission> missionList = dailyMissionRepository.findAllByManito(roomUser);

        return missionList.stream().map(dm -> {
            Mission m = dm.getMission();
            List<MissionStatus> statusList = missionStatusRepository.findByRoomUserAndDailyMission(roomUser, dm);
            boolean completed = statusList.stream().anyMatch(MissionStatus::isCompleted);

            return MissionListItemDto.from(
                    m.getId(),
                    m.getTitle(),
                    m.getDescription(),
                    m.getDifficulty(),
                    m.getChannelList(),
                    dm.getMissionDate(),
                    completed
            );
        }).toList();
    }
    @Transactional
    public void completeMission(Long userId, Long missionStatusId) {
        // 1. 현재 참여중인 방의 RoomUser 가져오기
        List<RoomUser> activeRooms = roomUserRepository.findActiveRoomsForUser(
                userId, List.of(RoomStatus.NOT_STARTED, RoomStatus.IN_PROGRESS)
        );
        if (activeRooms.isEmpty()) {
            throw new IllegalStateException("현재 참여 중인 방이 없습니다.");
        }
        RoomUser roomUser = activeRooms.get(0);

        // 2. MissionStatus 조회
        MissionStatus status = missionStatusRepository.findById(missionStatusId)
                .orElseThrow(() -> new IllegalArgumentException("해당 미션 상태가 존재하지 않습니다."));

        // 3. 사용자 일치 여부 확인
        if (!Objects.equals(status.getRoomUser().getUserId(), userId)) {
            throw new IllegalStateException("본인의 미션만 완료할 수 있습니다.");
        }

        // 4. 완료 처리
        if (!status.isCompleted()) {
            status.complete();
        }
    }


}
