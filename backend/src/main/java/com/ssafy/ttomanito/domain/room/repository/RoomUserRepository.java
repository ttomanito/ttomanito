package com.ssafy.ttomanito.domain.room.repository;

import com.ssafy.ttomanito.domain.room.dto.response.ParticipantResponse;
import com.ssafy.ttomanito.domain.room.entity.RoomUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import com.ssafy.ttomanito.domain.room.entity.RoomStatus;

import java.util.List;
import java.util.Optional;

public interface RoomUserRepository extends JpaRepository<RoomUser, Long> {
    // 사용자가 참여한 방 중에서 상태가 `NOT_STARTED` 또는 `IN_PROGRESS`인 방을 찾고, 그 방에 참여 중인지 확인
    @Query("SELECT ru FROM RoomUser ru JOIN Room r ON ru.roomId = r.id WHERE ru.userId = :userId AND r.status IN :statuses")
    List<RoomUser> findActiveRoomsForUser(@Param("userId") Long userId, @Param("statuses") List<RoomStatus> statuses);

    @Query("""
       select new com.ssafy.ttomanito.domain.room.dto.response.ParticipantResponse(
           ru.userId, ru.statusMessage
       )
       from RoomUser ru
       where ru.roomId = :roomId
       """)
    List<ParticipantResponse> findParticipants(Long roomId);

    @Query("select ru.userId from RoomUser ru where ru.roomId = :roomId")
    List<Long> findUserIdsByRoomId(Long roomId);

    boolean existsByRoomIdAndUserId(Long roomId, Long userId);

    void deleteByRoomIdAndUserId(Long roomId, Long userId);

    Optional<RoomUser> findByRoomIdAndUserId(Long roomId, Long userId);


}
