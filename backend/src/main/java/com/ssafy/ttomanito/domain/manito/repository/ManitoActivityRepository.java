package com.ssafy.ttomanito.domain.manito.repository;

import com.ssafy.ttomanito.domain.manito.entity.ManitoActivity;
import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface ManitoActivityRepository extends JpaRepository<ManitoActivity, Long> {
    // 한 방(roomId)에 속한 모든 활동 기록
    @Query("""
      SELECT a 
      FROM ManitoActivity a 
      WHERE a.roomUser.room.roomId = :roomId
    """)
    List<ManitoActivity> findByRoomId(@Param("roomId") Long roomId);
}
