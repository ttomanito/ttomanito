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

    /* 단일 날짜의 미션 */
    Optional<DailyMission> findByManito_UserIdAndMissionDate(Long manitoUserId, LocalDate missionDate);
    /* 방(roomId) + manito(userId) 로 모든 미션 조회 ── ★ 핵심 수정 */
    List<DailyMission> findAllByRoom_RoomIdAndManito_UserId(Long roomId, Long manitoUserId);

    /* 특정 RoomUser(=manito) 의 전체 미션 */
    List<DailyMission> findAllByManito_UserId(Long manitoUserId);
}