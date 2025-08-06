package com.ssafy.ttomanito.domain.manito.repository;

import com.ssafy.ttomanito.domain.manito.entity.ManitoAssignment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
public interface ManitoAssignmentRepository extends JpaRepository<ManitoAssignment, Long> {
    Optional<ManitoAssignment> findByManito_RoomUserIdAndRoom_RoomId(Long manitoRuId, Long roomId);
    Optional<ManitoAssignment> findByManitee_RoomUserIdAndRoom_RoomId(Long maniteeRuId, Long roomId);//    List<ManitoAssignment> findByRoom_RoomId(Long roomId);

//    void deleteByRoom_RoomId(Long roomId);
//    Optional<ManitoAssignment> findByRoom_RoomIdAndManitee_User_UserId(Long roomId, Long userId);
//    // 룸ID + 마니또 UserPK 기준
//    Optional<ManitoAssignment> findByRoom_RoomIdAndManito_User_UserId(Long roomId, Long userId);


//    boolean existsByManitee_RoomUserIdAndManito_RoomUserIdAndRoom_RoomId(
//            Long maniteeRuId, Long manitoRuId, Long roomId);

//    Optional<ManitoAssignment> findByManito_RoomUserId(Long ruId);
//    Optional<ManitoAssignment> findByManitee_RoomUserId(Long ruId);
//
    /* ────────── 단순 userId 기준 조회 ────────── */
//    Optional<ManitoAssignment> findByManito_UserId(Long userId);
//
//    Optional<ManitoAssignment> findByManitee_UserId(Long userId);
//    @Query("""
//    SELECT ma
//    FROM ManitoAssignment ma
//    JOIN ma.room r
//    WHERE ma.manitee.userId = :userId
//      AND r.status = com.ssafy.ttomanito.domain.room.entity.RoomStatus.IN_PROGRESS
//""")
//    Optional<ManitoAssignment> findActiveAssignmentByManiteeUserId(Long userId);
//
}

