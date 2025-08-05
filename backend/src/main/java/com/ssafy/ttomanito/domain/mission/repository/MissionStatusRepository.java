package com.ssafy.ttomanito.domain.mission.repository;


import com.ssafy.ttomanito.domain.mission.entity.DailyMission;
import com.ssafy.ttomanito.domain.mission.entity.MissionStatus;
import com.ssafy.ttomanito.domain.room.entity.RoomUser;
import com.ssafy.ttomanito.domain.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface MissionStatusRepository extends JpaRepository<MissionStatus, Long> {

    List<MissionStatus> findByUserAndDailyMission(User user, DailyMission dailyMission);

}
