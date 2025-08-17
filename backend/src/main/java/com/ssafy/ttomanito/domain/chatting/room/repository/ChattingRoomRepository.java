package com.ssafy.ttomanito.domain.chatting.room.repository;

import com.ssafy.ttomanito.domain.chatting.room.entity.ChattingRoom;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ChattingRoomRepository extends JpaRepository<ChattingRoom, Long> {
    Optional<ChattingRoom> findByManitoAssignmentManitoAssignmentId(Long manitoAssignmentId);

    @EntityGraph(attributePaths = "manitoAssignment")
    Optional<ChattingRoom> findWithAssignmentByChattingRoomId(Long chattingRoomId);
}