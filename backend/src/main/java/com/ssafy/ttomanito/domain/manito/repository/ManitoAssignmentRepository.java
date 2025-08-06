package com.ssafy.ttomanito.domain.manito.repository;

import com.ssafy.ttomanito.domain.manito.entity.ManitoAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;
public interface ManitoAssignmentRepository extends JpaRepository<ManitoAssignment, Long> {
    Optional<ManitoAssignment> findByRoom_RoomIdAndManitee_UserId(Long roomId, Long maniteeUserId);

    /* ────────── 방 기준 조회/삭제 ────────── */
    List<ManitoAssignment> findByRoom_RoomId(Long roomId);
    void deleteByRoom_RoomId(Long roomId);

    Optional<ManitoAssignment> findByManito_RoomUserIdAndRoom_RoomId(Long manitoRuId, Long roomId);
    Optional<ManitoAssignment> findByManitee_RoomUserIdAndRoom_RoomId(Long maniteeRuId, Long roomId);

    boolean existsByManitee_RoomUserIdAndManito_RoomUserIdAndRoom_RoomId(
            Long maniteeRuId, Long manitoRuId, Long roomId);

    Optional<ManitoAssignment> findByManito_RoomUserId(Long ruId);
    Optional<ManitoAssignment> findByManitee_RoomUserId(Long ruId);

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

