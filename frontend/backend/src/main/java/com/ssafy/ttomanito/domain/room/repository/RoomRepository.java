package com.ssafy.ttomanito.domain.room.repository;

import com.ssafy.ttomanito.domain.room.entity.Room;
import com.ssafy.ttomanito.domain.room.entity.RoomStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface RoomRepository extends JpaRepository<Room, Long> {
    /**
     * User PK + 상태로 방 조회
     */
    Optional<Room> findByCreator_UserIdAndStatus(Long creatorId, RoomStatus status);

    Optional<Room> findByRoomIdAndCreator_UserId(Long roomId, Long creatorId);

    List<Room> findAllByEndDateBeforeAndStatusNot(LocalDate date, RoomStatus status);

    @Query("""
            SELECT CASE WHEN COUNT(r) > 0 THEN true ELSE false END
            FROM Room r
            WHERE r.creator.userId = :userId
              AND r.status IN :statuses
            """)
    boolean checkCreator(
            @Param("userId") Long userId,
            @Param("statuses") List<RoomStatus> statuses
    );


}
