package com.ssafy.ttomanito.domain.room.repository;

import com.ssafy.ttomanito.domain.room.entity.MissionDay;
import com.ssafy.ttomanito.domain.room.entity.Weekday;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface MissionDayRepository extends JpaRepository<MissionDay, Long> {

    /**
     * room.id 값으로 MissionDay 목록 조회
     */
    List<MissionDay> findByRoom_roomId(Long roomId);

    /**
     * room.id 값으로 요일(Weekday enum)만 조회
     */
    @Query("SELECT md.day " +
            "FROM MissionDay md " +
            "WHERE md.room.roomId = :roomId")
    List<Weekday> findWeekdaysByRoomId(@Param("roomId") Long roomId);

    /**
     * room.id 값으로 일괄 삭제
     */
    void deleteByRoom_roomId(Long roomId);
    boolean existsByRoom_roomIdAndDay(Long roomId, Weekday day);
}
