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


        //------------------------------------------------------------
        // 1) 내 통화 시간 합계
        @Query("""
      SELECT COALESCE(SUM(a.callTime), 0)
      FROM ManitoActivity a
      WHERE a.roomUser.room.roomId = :roomId
        AND a.roomUser.user.userId = :userId
    """)
        Long sumCallTimeByRoomAndUser(@Param("roomId") Long roomId,
                                      @Param("userId") Long userId);

        // 2) 내 채팅 횟수 합계
        @Query("""
      SELECT COALESCE(SUM(a.chatCount), 0)
      FROM ManitoActivity a
      WHERE a.roomUser.room.roomId = :roomId
        AND a.roomUser.user.userId = :userId
    """)
        Integer sumChatCountByRoomAndUser(@Param("roomId") Long roomId,
                                          @Param("userId") Long userId);

        // 3) 그룹 통화 시간 평균
        @Query("""
      SELECT COALESCE(AVG(a.callTime), 0)
      FROM ManitoActivity a
      WHERE a.roomUser.room.roomId = :roomId
    """)
        Double avgCallTimeByRoom(@Param("roomId") Long roomId);

        // 4) 그룹 채팅 횟수 평균
        @Query("""
      SELECT COALESCE(AVG(a.chatCount), 0)
      FROM ManitoActivity a
      WHERE a.roomUser.room.roomId = :roomId
    """)
        Double avgChatCountByRoom(@Param("roomId") Long roomId);
//
//        // 만약 pokeCount 필드가 다시 들어갔다면, 동일한 형식으로 sum/avg 추가
//        @Query("""
//      SELECT COALESCE(SUM(a.pokeCount), 0)
//      FROM ManitoActivity a
//      WHERE a.roomUser.room.roomId = :roomId
//        AND a.roomUser.user.userId = :userId
//    """)
//        Integer sumPokeCountByRoomAndUser(@Param("roomId") Long roomId,
//                                          @Param("userId") Long userId);
//
//        @Query("""
//      SELECT COALESCE(AVG(a.pokeCount), 0)
//      FROM ManitoActivity a
//      WHERE a.roomUser.room.roomId = :roomId
//    """)
//        Double avgPokeCountByRoom(@Param("roomId") Long roomId);

    }
