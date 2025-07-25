package com.ssafy.ttomanito.domain.room.repository;

import com.ssafy.ttomanito.domain.room.dto.response.ParticipantResponse;
import com.ssafy.ttomanito.domain.room.model.RoomUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface RoomUserRepository extends JpaRepository<RoomUser, Long> {

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
