package com.ssafy.ttomanito.domain.chatting.room.repository;

import com.ssafy.ttomanito.domain.chatting.room.entity.ChattingRoom;
import com.ssafy.ttomanito.domain.chatting.voice.entity.VoiceChat;
import com.ssafy.ttomanito.domain.room.entity.RoomUser;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ChattingRepository extends JpaRepository<ChattingRoom, Long> {



    @EntityGraph(attributePaths = "manitoAssignment")
    Optional<ChattingRoom> findWithAssignmentByChattingRoomId(Long chattingRoomId);
}