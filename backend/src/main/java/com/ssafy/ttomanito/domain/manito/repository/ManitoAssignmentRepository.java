package com.ssafy.ttomanito.domain.manito.repository;

import com.ssafy.ttomanito.domain.manito.entity.ManitoAssignment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ManitoAssignmentRepository extends JpaRepository<ManitoAssignment, Long> {
    Optional<ManitoAssignment> findByManito_RoomUserIdAndRoom_RoomId(Long manitoRuId, Long roomId);

    Optional<ManitoAssignment> findByManitee_RoomUserIdAndRoom_RoomId(Long maniteeRuId, Long roomId);//    List<ManitoAssignment> findByRoom_RoomId(Long roomId);

    Optional<ManitoAssignment> findByManito_RoomUserId(Long manitoRoomUserId);

    Optional<ManitoAssignment> findByManitee_RoomUserId(Long maniteeRoomUserId);

}

