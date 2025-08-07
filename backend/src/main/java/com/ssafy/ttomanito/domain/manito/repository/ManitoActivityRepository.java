package com.ssafy.ttomanito.domain.manito.repository;

import com.ssafy.ttomanito.domain.manito.entity.ManitoActivity;
import com.ssafy.ttomanito.domain.room.entity.RoomUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ManitoActivityRepository extends JpaRepository<ManitoActivity, RoomUser> {

    /**
     * 한 방(roomId)에 속한 모든 활동 기록 조회
     */
    @Query("""
      SELECT a
      FROM ManitoActivity a
      WHERE a.roomUser.room.roomId = :roomId
    """)
    List<ManitoActivity> findByRoomId(@Param("roomId") Long roomId);

    /**
     * 1) 특정 방·특정 사용자 통화 시간 합계
     */
    @Query("""
      SELECT COALESCE(SUM(a.callTime), 0)
      FROM ManitoActivity a
      WHERE a.roomUser.room.roomId = :roomId
        AND a.roomUser.user.userId = :userId
    """)
    Long sumCallTimeByRoomAndUser(@Param("roomId") Long roomId,
                                  @Param("userId") Long userId);

    /**
     * 2) 특정 방·특정 사용자 채팅 횟수 합계
     */
    @Query("""
      SELECT COALESCE(SUM(a.chatCount), 0)
      FROM ManitoActivity a
      WHERE a.roomUser.room.roomId = :roomId
        AND a.roomUser.user.userId = :userId
    """)
    Long sumChatCountByRoomAndUser(@Param("roomId") Long roomId,
                                   @Param("userId") Long userId);

    @Query("""
      SELECT COALESCE(SUM(a.missionSuccessCount), 0)
      FROM ManitoActivity a
      WHERE a.roomUser.room.roomId = :roomId
        AND a.roomUser.user.userId = :userId
    """)
    Long sumMissionSuccessCountByRoomAndUser(
            @Param("roomId") Long roomId,
            @Param("userId") Long userId
    );
    /**
     * 3) 특정 방 전체 통화 시간 평균
     */
    @Query("""
      SELECT COALESCE(AVG(a.callTime), 0)
      FROM ManitoActivity a
      WHERE a.roomUser.room.roomId = :roomId
    """)
    Double avgCallTimeByRoom(@Param("roomId") Long roomId);

    /**
     * 4) 특정 방 전체 채팅 횟수 평균
     */
    @Query("""
      SELECT COALESCE(AVG(a.chatCount), 0)
      FROM ManitoActivity a
      WHERE a.roomUser.room.roomId = :roomId
    """)
    Double avgChatCountByRoom(@Param("roomId") Long roomId);
}
