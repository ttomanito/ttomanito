package com.ssafy.ttomanito.domain.mission.repository;

import com.ssafy.ttomanito.domain.mission.entity.DailyMission;
import com.ssafy.ttomanito.domain.room.entity.RoomUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
@Repository

public interface DailyMissionRepository extends JpaRepository<DailyMission, Long> {
    Optional<DailyMission> findByManitoAndMissionDate(RoomUser manito, LocalDate missionDate);
// ✅ 현재 마니또 방에서 받은 모든 미션 (중복 방지용)
    List<DailyMission> findAllByManitoRoomIdAndManitoUserId(Long roomId, Long userId);
    List<DailyMission> findAllByManito(RoomUser manito);

}
