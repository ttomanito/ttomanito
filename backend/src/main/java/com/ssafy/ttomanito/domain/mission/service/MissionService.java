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
import com.ssafy.ttomanito.domain.user.entity.User;
import com.ssafy.ttomanito.domain.user.repository.UserRepository;
import com.ssafy.ttomanito.global.exception.BadRequestException;
import com.ssafy.ttomanito.global.exception.NotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
public class MissionService {

    private final RoomUserRepository roomUserRepository;
    private final MissionRepository missionRepository;
    private final DailyMissionRepository dailyMissionRepository;
    private final MissionStatusRepository missionStatusRepository;
    private final UserRepository userRepository;

    public MissionResponseDto getTodayMission(Long userId) {
        RoomUser roomUser = roomUserRepository.findActiveRoomsForUser(
                        userId, List.of(RoomStatus.NOT_STARTED, RoomStatus.IN_PROGRESS))
                .stream()
                .findFirst()
                .orElseThrow(() -> new NotFoundException("현재 참여 중인 마니또 방이 없습니다"));
        LocalDate today = LocalDate.now();

        // ✅ 1. 오늘 미션이 이미 있는 경우
        Optional<DailyMission> existing = dailyMissionRepository.findByManito_UserIdAndMissionDate(userId, today);
        if (existing.isPresent()) {
            DailyMission dm = existing.get();

            List<MissionStatus> statusList = missionStatusRepository.findByUserAndDailyMission(roomUser.getUser(), dm);  // ✅ 수정
            boolean completed = statusList.stream().anyMatch(MissionStatus::isCompleted);
            Long missionStatusId = statusList.stream()
                    .findFirst()
                    .map(MissionStatus::getId)
                    .orElse(null);
            Mission m = dm.getMission();
            return new MissionResponseDto(
                    m.getId(),
                    m.getTitle(),
                    m.getDescription(),
                    m.getDifficulty(),
                    m.getChannel(),
                    m.getType(),
                    completed,
                    missionStatusId
            );
        }

        // ✅ 2. 새로운 미션 부여
        List<DailyMission> pastMissions = dailyMissionRepository
                .findAllByRoom_RoomIdAndManito_UserId(roomUser.getRoom().getRoomId(), userId);

        Set<Long> pastMissionIds = pastMissions.stream()
                .map(dm -> dm.getMission().getId())
                .collect(Collectors.toSet());

        List<Mission> availableMissions = missionRepository.findAll().stream()
                .filter(m -> !pastMissionIds.contains(m.getId()))
                .toList();

        if (availableMissions.isEmpty()) {
            throw new BadRequestException("부여할 새로운 미션이 없습니다");
        }

        Mission selected = availableMissions.get(new Random().nextInt(availableMissions.size()));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("해당 유저를 찾을 수 없습니다: id=" + userId));

        DailyMission newDaily = new DailyMission(
                user,
                roomUser.getRoom(),
                selected,
                today
        );
        dailyMissionRepository.save(newDaily);

        MissionStatus status = new MissionStatus(
                user,
                roomUser,
                newDaily,
                false
        );
        missionStatusRepository.save(status);

        return new MissionResponseDto(
                selected.getId(),
                selected.getTitle(),
                selected.getDescription(),
                selected.getDifficulty(),
                selected.getChannel(),
                selected.getType(),
                false,
                status.getId()
        );
    }

    @Transactional(readOnly = true)
    public List<MissionListItemDto> getMyMissionList(Long userId) {
        RoomUser roomUser = roomUserRepository.findActiveRoomsForUser(
                        userId, List.of(RoomStatus.NOT_STARTED, RoomStatus.IN_PROGRESS))
                .stream()
                .findFirst()
                .orElseThrow(() -> new NotFoundException("현재 참여 중인 방이 없습니다"));

        List<DailyMission> missionList = dailyMissionRepository.findAllByManito_UserId(userId);

        return missionList.stream().map(dm -> {
            Mission m = dm.getMission();
            List<MissionStatus> statusList = missionStatusRepository.findByUserAndDailyMission(roomUser.getUser(), dm);  // ✅ 수정
            boolean completed = statusList.stream().anyMatch(MissionStatus::isCompleted);
            Long missionStatusId = statusList.stream()
                    .findFirst()
                    .map(MissionStatus::getId)
                    .orElse(null); // 없을 경우 대비

            return MissionListItemDto.from(
                    m.getId(),
                    missionStatusId,  // ✅ 추가
                    m.getTitle(),
                    m.getDescription(),
                    m.getDifficulty(),
                    m.getChannelList(),
                    m.getType(),
                    dm.getMissionDate(),
                    completed
            );
        }).toList();
    }

    public void completeMission(Long userId, Long missionStatusId) {
        RoomUser roomUser = roomUserRepository.findActiveRoomsForUser(
                        userId, List.of(RoomStatus.NOT_STARTED, RoomStatus.IN_PROGRESS))
                .stream()
                .findFirst()
                .orElseThrow(() -> new NotFoundException("현재 참여 중인 방이 없습니다"));

        MissionStatus status = missionStatusRepository.findById(missionStatusId)
                .orElseThrow(() -> new NotFoundException("해당 미션 상태를 찾을 수 없습니다: id=" + missionStatusId));

        // ✅ 사용자 확인 시 User 기준으로 비교
        if (!Objects.equals(status.getUser().getUserId(), userId)) {
            throw new BadRequestException("본인 미션만 완료할 수 있습니다");
        }

        if (!status.isCompleted()) {
            status.complete();
        }
    }

}
