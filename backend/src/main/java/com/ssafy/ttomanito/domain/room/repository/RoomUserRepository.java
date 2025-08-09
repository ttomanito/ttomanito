package com.ssafy.ttomanito.domain.room.repository;

import com.ssafy.ttomanito.domain.manito.entity.ManitoAssignment;
import com.ssafy.ttomanito.domain.room.dto.response.ParticipantResponse;
import com.ssafy.ttomanito.domain.room.entity.RoomUser;
import com.ssafy.ttomanito.domain.room.entity.RoomStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface RoomUserRepository extends JpaRepository<RoomUser, Long> {
//    Optional<RoomUser> findByRoom_RoomIdAndUser_UserId(Long roomId, Long userId);
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
    @Query("""
       SELECT new com.ssafy.ttomanito.domain.room.dto.response.ParticipantResponse(
           u.userId,         
           u.name,           
           ru.statusMessage,  
           r.creator.userId    
       )
       FROM RoomUser ru
       JOIN ru.user u
       JOIN ru.room r
       WHERE r.roomId = :roomId
       """)
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

    @Query("""
        SELECT ru
        FROM RoomUser ru
        JOIN ru.room r
        JOIN ru.user u
        WHERE r.status = com.ssafy.ttomanito.domain.room.entity.RoomStatus.IN_PROGRESS
          AND u.status = 'ACTIVE'
    """)
    List<RoomUser> findUsersInProgressRoom();

    List<RoomUser> findByRoom_RoomId(Long roomId);


    /**
     * Room ID와 User ID로 정확히 한 건의 RoomUser 만 찾습니다.
     */
    @Query("""
        SELECT ru
        FROM RoomUser ru
        WHERE ru.room.roomId = :roomId
          AND ru.user.userId = :userId
    """)
    Optional<RoomUser> findByRoomIdAndUserId(
            @Param("roomId") Long roomId,
            @Param("userId") Long userId
    );

    /**
     * 같은 방(roomId)에 속해 있으면서 userId와 다른 상대 한 명을 찾습니다.
     */
    @Query("""
        SELECT ru
        FROM RoomUser ru
        WHERE ru.room.roomId = :roomId
          AND ru.user.userId <> :userId
    """)
    Optional<RoomUser> findOpponent(
            @Param("roomId") Long roomId,
            @Param("userId") Long userId
    );
    /**
     * userId 의 사용자가 IN_PROGRESS 상태인 방의 RoomUser 를 한 건 조회
     */
    Optional<RoomUser> findByUserUserIdAndRoomStatus(Long userId, RoomStatus status);

    // 필요하다면 방 ID + Room.status 로 전체 ACTIVE 멤버 조회
    List<RoomUser> findByRoom_RoomIdAndRoom_Status(Long roomId, RoomStatus status);
    /**
     * 방 ID + 여러 상태로 RoomUser 목록 조회
     */
    List<RoomUser> findByRoom_RoomIdAndRoom_StatusIn(Long roomId, List<RoomStatus> statuses);


    /** 방의 모든 RoomUser(어제 집계 대상 포함) 조회 */
    List<RoomUser> findByRoom_Status(RoomStatus status);

    /** 방의 특정 상태들인 RoomUser 전체 조회 */
    List<RoomUser> findByRoom_StatusIn(List<RoomStatus> statuses);

    //해당 유저의 모든 roomuser id 구하기(끝난거 모두)
    @Query("""
        select ru from RoomUser ru
        join fetch ru.room r
        where ru.user.userId = :userId
          and r.status = 'FINISHED'
    """)
    List<RoomUser> findAllFinishedByUserId(@Param("userId") Long userId);

}
