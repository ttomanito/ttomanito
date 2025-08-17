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
import com.ssafy.ttomanito.domain.room.entity.Weekday;
import com.ssafy.ttomanito.domain.room.repository.MissionDayRepository;
import com.ssafy.ttomanito.domain.room.repository.RoomUserRepository;
import com.ssafy.ttomanito.domain.user.entity.User;
import com.ssafy.ttomanito.domain.user.repository.UserRepository;
import com.ssafy.ttomanito.global.exception.BadRequestException;
import com.ssafy.ttomanito.global.exception.NotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.*;
import java.util.stream.Collectors;
@Slf4j
@Service
@Transactional
@RequiredArgsConstructor
public class MissionService {

    private final RoomUserRepository roomUserRepository;
    private final MissionRepository missionRepository;
    private final DailyMissionRepository dailyMissionRepository;
    private final MissionStatusRepository missionStatusRepository;
    private final UserRepository userRepository;
    private final MissionDayRepository missionDayRepository;

    public MissionResponseDto getTodayMission(Long userId) {
        List<RoomUser> actives = roomUserRepository.findActiveRoomsForUser(
                userId, List.of(RoomStatus.NOT_STARTED, RoomStatus.IN_PROGRESS));
        if (actives.isEmpty()) throw new NotFoundException("현재 참여 중인 마니또 방이 없습니다");

        LocalDate today = LocalDate.now(ZoneId.of("Asia/Seoul"));
        Weekday todayW = Weekday.from(today.getDayOfWeek());

        // ✅ 오늘 요일을 가진 방 우선 선택
        RoomUser roomUser = actives.stream()
                .filter(ru -> missionDayRepository
                        .findWeekdaysByRoomId(ru.getRoom().getRoomId())
                        .contains(todayW))
                .findFirst()
                .orElseThrow(() -> new BadRequestException("오늘은 미션 발급 요일이 아닙니다."));

        Long roomId = roomUser.getRoom().getRoomId();

        // ✅ 1) 해당 '방' 기준으로 오늘 이미 발급된 미션이 있는지 먼저 확인
        Optional<DailyMission> existing =
                dailyMissionRepository.findByRoom_RoomIdAndManito_UserIdAndMissionDate(roomId, userId, today);
        if (existing.isPresent()) {
            DailyMission dm = existing.get();
            List<MissionStatus> statusList = missionStatusRepository.findByUserAndDailyMission(roomUser.getUser(), dm);
            boolean completed = statusList.stream().anyMatch(MissionStatus::isCompleted);
            Long missionStatusId = statusList.stream().findFirst().map(MissionStatus::getId).orElse(null);
            Mission m = dm.getMission();
            return new MissionResponseDto(
                    m.getId(), m.getTitle(), m.getDescription(),
                    m.getDifficulty(), m.getChannel(), m.getType(),
                    completed, missionStatusId
            );
        }

//        Long roomId = roomUser.getRoom().getRoomId();
//        if (!isMissionDay(roomId, today)) {
//            throw new BadRequestException("오늘은 미션 발급 요일이 아닙니다.");
//        }
        // ✅ 2) 새 미션 부여 (기존 로직 그대로, roomId는 위에서 고른 방)
        List<DailyMission> pastMissions =
                dailyMissionRepository.findAllByRoom_RoomIdAndManito_UserId(roomId, userId);
        Set<Long> pastMissionIds = pastMissions.stream().map(dm -> dm.getMission().getId()).collect(Collectors.toSet());
        List<Mission> availableMissions = missionRepository.findAll().stream()
                .filter(m -> !pastMissionIds.contains(m.getId())).toList();
        if (availableMissions.isEmpty()) throw new BadRequestException("부여할 새로운 미션이 없습니다");

        Mission selected = availableMissions.get(new Random().nextInt(availableMissions.size()));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("해당 유저를 찾을 수 없습니다: id=" + userId));

        DailyMission newDaily = new DailyMission(user, roomUser.getRoom(), selected, today);
        dailyMissionRepository.save(newDaily);

        MissionStatus status = new MissionStatus(user, roomUser, newDaily, false);
        missionStatusRepository.save(status);

        return new MissionResponseDto(
                selected.getId(), selected.getTitle(), selected.getDescription(),
                selected.getDifficulty(), selected.getChannel(), selected.getType(),
                false, status.getId()
        );
    }

    @Transactional(readOnly = true)
    public List<MissionListItemDto> getMyMissionList(Long userId) {
        RoomUser roomUser = roomUserRepository.findActiveRoomsForUser(
                        userId, List.of(RoomStatus.NOT_STARTED, RoomStatus.IN_PROGRESS))
                .stream()
                .findFirst()
                .orElseThrow(() -> new NotFoundException("현재 참여 중인 방이 없습니다"));
        Long roomId = roomUser.getRoom().getRoomId();

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
                    completed,
                    roomId
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
