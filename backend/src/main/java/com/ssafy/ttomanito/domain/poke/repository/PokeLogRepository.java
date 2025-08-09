package com.ssafy.ttomanito.domain.poke.repository;

import com.ssafy.ttomanito.domain.poke.entity.PokeLog;
import com.ssafy.ttomanito.domain.room.entity.RoomUser;
import com.ssafy.ttomanito.domain.user.entity.User;
import org.springframework.data.repository.query.Param;
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
    // 특정 방에서 내가 '보낸' 찌르기 총합 (내가 마니띠일때)
    @Query("""
      select count(pl)
      from PokeLog pl
      where pl.assignment.room.roomId = :roomId
        and pl.roomUser.roomUserId = :roomUserId
    """)
    Long countSentInRoom(@Param("roomId") Long roomId,
                         @Param("roomUserId") Long roomUserId);

    // 내가 '당한' 찌르기 총합 (수신자=나) — 같은 방 한정
    Long countByManitee_UserIdAndAssignment_Room_RoomId(Long userId, Long roomId);
    // 이 배정의 방에서 sender가 보낸 poke 수
    @Query("""
      select count(p)
      from PokeLog p
      where p.assignment.manitoAssignmentId = :assignId
        and p.roomUser.roomUserId = :senderRuId
      """)
    long countSentInAssignment(@Param("assignId") Long assignId,
                               @Param("senderRuId") Long senderRuId);

    // 이 배정의 방에서 receiver(=manitee)가 받은 poke 수
    @Query("""
  select count(p)
  from PokeLog p
  where p.assignment.manitoAssignmentId = :assignId
    and p.manitee.userId = :receiverRuId
  """)
    long countReceivedInAssignment(@Param("assignId") Long assignId,
                                   @Param("receiverRuId") Long receiverRuId);

}
