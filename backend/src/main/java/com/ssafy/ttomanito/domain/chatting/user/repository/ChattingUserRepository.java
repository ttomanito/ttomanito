package com.ssafy.ttomanito.domain.chatting.user.repository;

import com.ssafy.ttomanito.domain.chatting.user.entity.ChattingUser;
import com.ssafy.ttomanito.domain.chatting.user.entity.ChattingUserId;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface ChattingUserRepository extends JpaRepository<ChattingUser, ChattingUserId> {
    List<ChattingUser> findAllByRoomUserUserUserId(Long userId);
    Optional<ChattingUser> findByChattingRoomChattingRoomIdAndRoomUserRoomUserId(Long roomId, Long roomUserId);
    List<ChattingUser> findAllByChattingRoomChattingRoomId(Long roomId);
}