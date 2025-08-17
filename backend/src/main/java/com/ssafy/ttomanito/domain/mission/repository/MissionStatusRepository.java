package com.ssafy.ttomanito.domain.mission.repository;


import com.ssafy.ttomanito.domain.mission.entity.DailyMission;
import com.ssafy.ttomanito.domain.mission.entity.MissionStatus;
import com.ssafy.ttomanito.domain.report.dto.MissionItemDto;
import com.ssafy.ttomanito.domain.room.entity.RoomUser;
import com.ssafy.ttomanito.domain.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface MissionStatusRepository extends JpaRepository<MissionStatus, Long> {

    List<MissionStatus> findByUserAndDailyMission(User user, DailyMission dailyMission);
    @Query("""
  select new com.ssafy.ttomanito.domain.report.dto.MissionItemDto(
    ms.dailyMission.mission.id,
    ms.dailyMission.mission.title,
    ms.dailyMission.mission.type,
    ms.completed,
    ms.completedAt
  )
  from MissionStatus ms
  where ms.roomUser.room.roomId = :roomId
    and ms.roomUser.roomUserId = :manittoRuId
  order by ms.completedAt desc
""")
    List<MissionItemDto> findMissionsDoneByManitto(
            @Param("roomId") Long roomId,
            @Param("manittoRuId") Long manittoRoomUserId
    );

    //수행한 미션만 끌고오기
    @Query("""
  select new com.ssafy.ttomanito.domain.report.dto.MissionItemDto(
    ms.dailyMission.mission.id,
    ms.dailyMission.mission.title,
    ms.dailyMission.mission.type,
    ms.completed,
    ms.completedAt
  )
  from MissionStatus ms
  where ms.roomUser.room.roomId = :roomId
    and ms.roomUser.roomUserId = :meRuId
    and ms.completed = true
  order by ms.completedAt desc
""")
    List<MissionItemDto> findMissionsIDid(
            @Param("roomId") Long roomId,
            @Param("meRuId") Long meRoomUserId
    );

    @Query("""
      select count(ms)
      from MissionStatus ms
      where ms.roomUser.room.roomId = :roomId
        and ms.roomUser.roomUserId = :meRuId
        and ms.completed = true
    """)
        long countMissionsIDid(@Param("roomId") Long roomId,
                               @Param("meRuId") Long meRoomUserId);


}
