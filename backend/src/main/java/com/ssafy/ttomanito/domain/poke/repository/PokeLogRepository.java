package com.ssafy.ttomanito.domain.poke.repository;

import com.ssafy.ttomanito.domain.poke.entity.PokeLog;
import com.ssafy.ttomanito.domain.room.entity.RoomUser;
import com.ssafy.ttomanito.domain.user.entity.User;
import io.lettuce.core.dynamic.annotation.Param;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface PokeLogRepository extends JpaRepository<PokeLog, Long> {

    /**
     * 주어진 RoomUser별, 특정 날짜의 Poke 수를 집계하여 반환
     *
     * @param roomUserId RoomUser 엔티티의 PK
     * @param date       집계 대상 날짜 (YYYY-MM-DD)
     * @return 해당 날짜의 Poke 수 합계
     */
    @Query("""
      SELECT COALESCE(COUNT(pl), 0)
      FROM PokeLog pl
      WHERE pl.roomUser.roomUserId = :roomUserId
        AND FUNCTION('DATE', pl.createdAt) = :date
    """)
    Long sumPokeCountByRoomUserAndDate(
            @Param("roomUserId") Long roomUserId,
            @Param("date") LocalDate date
    );
}
