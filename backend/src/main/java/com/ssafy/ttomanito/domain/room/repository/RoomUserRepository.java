package com.ssafy.ttomanito.domain.room.repository;

import com.ssafy.ttomanito.domain.room.dto.response.ParticipantResponse;
import com.ssafy.ttomanito.domain.room.entity.RoomUser;
import com.ssafy.ttomanito.domain.room.entity.RoomStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface RoomUserRepository extends JpaRepository<RoomUser, Long> {

    /**
     * 사용자가 참여한 방 중 상태가 NOT_STARTED or IN_PROGRESS인 RoomUser 조회
     */
    @Query("SELECT ru " +
            "FROM RoomUser ru " +
            " WHERE ru.user.userId = :userId " +
            "   AND ru.room.status IN :statuses")
    List<RoomUser> findActiveRoomsForUser(
            @Param("userId") Long userId,
            @Param("statuses") List<RoomStatus> statuses
    );

    /**
     * 방 참여자 정보(ParticipantResponse) 조회
     */
    @Query("SELECT new com.ssafy.ttomanito.domain.room.dto.response.ParticipantResponse(" +
            "    ru.user.userId, ru.statusMessage" +
            ") " +
            "FROM RoomUser ru " +
            "WHERE ru.room.roomId = :roomId")
    List<ParticipantResponse> findParticipantsByRoomId(@Param("roomId") Long roomId);

    /**
     * 방 참여자 PK 리스트 조회
     */
    @Query("SELECT ru.user.userId " +
            "FROM RoomUser ru " +
            "WHERE ru.room.roomId = :roomId")
    List<Long> findUserIdsByRoomId(@Param("roomId") Long roomId);

    /** 존재 여부 확인 */
    boolean existsByRoom_roomIdAndUser_UserId(Long roomId, Long userId);

    /** 지정한 방·사용자 관계 삭제 */
    void deleteByRoom_roomIdAndUser_UserId(Long roomId, Long userId);

    /** 단일 RoomUser 조회 */
    Optional<RoomUser> findByRoom_roomIdAndUser_UserId(Long roomId, Long userId);

    @Query("SELECT ru FROM RoomUser ru WHERE ru.room.status = 'IN_PROGRESS'")
    List<RoomUser> findUsersInProgressRoom();
}
