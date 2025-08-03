package com.ssafy.ttomanito.domain.mission.repository;


import com.ssafy.ttomanito.domain.mission.entity.DailyMission;
import com.ssafy.ttomanito.domain.mission.entity.MissionStatus;
import com.ssafy.ttomanito.domain.room.entity.RoomUser;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface MissionStatusRepository extends JpaRepository<MissionStatus, Long> {

    Optional<MissionStatus> findByRoomUserAndDailyMission(RoomUser roomUser, DailyMission dailyMission);
}
