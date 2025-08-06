package com.ssafy.ttomanito.domain.chatting.voice.repository;

import com.ssafy.ttomanito.domain.chatting.room.entity.ChattingRoom;
import com.ssafy.ttomanito.domain.chatting.voice.entity.VoiceChat;
import com.ssafy.ttomanito.domain.chatting.voice.entity.VoiceChatId;
import com.ssafy.ttomanito.domain.room.entity.RoomUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface VoiceChatRepository
        extends JpaRepository<VoiceChat, Long> {

    // 통화 중인지 확인
    boolean existsByRoomUser_User_UserIdAndIsActiveTrue(Long userId);


    // 반대편(caller) 레코드 — userId와 다른 하나
    List<VoiceChat> findByChattingRoom_ChattingRoomId(Long chattingRoomId);

    // 신규: 특정 유저의 활성화된 모든 레코드 isActive=false 처리
    @Modifying
    @Query("UPDATE VoiceChat vc " +
            "SET vc.isActive = false " +
            "WHERE vc.roomUser.user.userId = :userId " +
            "  AND vc.isActive = true")
    int deactivateAllByUserId(@Param("userId") Long userId);
}

