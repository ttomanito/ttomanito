// src/main/java/com/ssafy/ttomanito/domain/room/repository/MissionDayRepository.java
package com.ssafy.ttomanito.domain.room.repository;

import com.ssafy.ttomanito.domain.room.entity.MissionDay;
import com.ssafy.ttomanito.domain.room.entity.Weekday;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface MissionDayRepository extends JpaRepository<MissionDay, Long> {

    List<MissionDay> findByRoomId(Long roomId);
    @Query(value = "SELECT day FROM mission_day WHERE room_id = :roomId", nativeQuery = true)
    List<Weekday> findWeekdaysByRoomId(@Param("roomId") Long roomId);

    void deleteByRoomId(Long roomId); // 요일 재설정/삭제가 필요할 때 사용하기 좋아요
}
