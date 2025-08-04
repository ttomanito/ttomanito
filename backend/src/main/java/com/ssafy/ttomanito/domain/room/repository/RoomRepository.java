package com.ssafy.ttomanito.domain.room.repository;

import com.ssafy.ttomanito.domain.room.entity.Room;
import com.ssafy.ttomanito.domain.room.entity.RoomStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface RoomRepository extends JpaRepository<Room, Long> {
    /** User PK + 상태로 방 조회 */
    Optional<Room> findByCreator_UserIdAndStatus(Long creatorId, RoomStatus status);
    Optional<Room> findByCreatorIdAndStatus(Long creatorId, RoomStatus status);
//    Optional<Room> findByRoomIdAndCreatorId(Long id, Long creatorId);
    Optional<Room> findByIdAndCreatorId(Long id, Long creatorId);
    List<Room> findAllByEndDateBeforeAndStatusNot(LocalDate date, RoomStatus status);
    
}
