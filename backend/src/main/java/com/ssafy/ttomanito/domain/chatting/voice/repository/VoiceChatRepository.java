package com.ssafy.ttomanito.domain.chatting.voice.repository;

import com.ssafy.ttomanito.domain.chatting.voice.entity.VoiceChat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

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

    /**
     * 주어진 RoomUser별, 특정 날짜에 종료된 통화의 총 지속시간(초)을 집계하여 반환
     */
    @Query("""
              SELECT COALESCE(SUM(vc.durationSec), 0)
              FROM VoiceChat vc
              WHERE vc.roomUser.roomUserId = :roomUserId
                AND FUNCTION('DATE', vc.endedAt) = :date
                AND vc.isActive = false
            """)
    Long sumDurationSecByRoomUserAndDate(
            @Param("roomUserId") Long roomUserId,
            @Param("date") LocalDate date
    );
    // 최신 종료 기록 1건
    Optional<VoiceChat> findTopByRoomUser_RoomUserIdAndIsActiveFalseOrderByEndedAtDesc(Long roomUserId);

    Optional<VoiceChat> findByChattingRoom_ChattingRoomIdAndRoomUser_RoomUserId(
            Long roomId, Long roomUserId
    );
    Optional<VoiceChat> findByChattingRoom_ManitoAssignment_ManitoAssignmentIdAndRoomUser_RoomUserId(
            Long manitoAssignmentId,
            Long roomUserId
    );

}

