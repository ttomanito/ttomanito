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

    /* ────────── 단건 조회 ────────── */
    Optional<ManitoAssignment> findByManito_UserIdAndRoom_RoomId(Long manitoId, Long roomId);   // ★ manito + room

    Optional<ManitoAssignment>
    findByManitee_UserIdAndRoom_RoomId(Long maniteeId, Long roomId); // (필요 시)

    /* ────────── exists(정답 여부) ────────── */
    boolean existsByManitee_UserIdAndManito_UserIdAndRoom_RoomId(
            Long maniteeId, Long manitoId, Long roomId);

    /* ────────── 단순 userId 기준 조회 ────────── */
    Optional<ManitoAssignment> findByManito_UserId(Long userId);

    Optional<ManitoAssignment> findByManitee_UserId(Long userId);
    @Query("""
    SELECT ma
    FROM ManitoAssignment ma
    JOIN ma.room r
    WHERE ma.manitee.userId = :userId
      AND r.status = com.ssafy.ttomanito.domain.room.entity.RoomStatus.IN_PROGRESS
""")
    Optional<ManitoAssignment> findActiveAssignmentByManiteeUserId(Long userId);

}

