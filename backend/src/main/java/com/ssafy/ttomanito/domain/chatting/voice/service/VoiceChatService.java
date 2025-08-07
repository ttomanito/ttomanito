package com.ssafy.ttomanito.domain.chatting.voice.service;

import com.ssafy.ttomanito.domain.chatting.room.entity.ChattingRoom;
import com.ssafy.ttomanito.domain.chatting.room.repository.ChattingRepository;
import com.ssafy.ttomanito.domain.chatting.voice.dto.CallSignalDto;
import com.ssafy.ttomanito.domain.chatting.voice.entity.VoiceChat;
import com.ssafy.ttomanito.domain.chatting.voice.repository.VoiceChatRepository;
import com.ssafy.ttomanito.domain.manito.entity.ManitoAssignment;
import com.ssafy.ttomanito.domain.room.entity.RoomUser;
import com.ssafy.ttomanito.domain.room.repository.RoomUserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import lombok.extern.slf4j.XSlf4j;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@Transactional
@RequiredArgsConstructor
public class VoiceChatService {

    private final ChattingRepository chattingRepository;
    private final RoomUserRepository roomUserRepository;
    private final VoiceChatRepository voiceChatRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public void startCall(Long chattingRoomId, Long callerUserId) {
        log.info("▶▶ ENTER acceptCall", new RuntimeException("stack trace"));

        if (voiceChatRepository.existsByRoomUser_User_UserIdAndIsActiveTrue(callerUserId)) {
            log.info("▶▶ 이미 통화 중이라 예외 발생");
            throw new IllegalStateException("이미 다른 방에서 진행 중인 통화가 있습니다.");
        }

        // 1) 채팅방 → ManitoAssignment → 룸 ID
        ChattingRoom cr = chattingRepository
                .findWithAssignmentByChattingRoomId(chattingRoomId)
                .orElseThrow(() -> new RuntimeException("채팅방을 찾을 수 없습니다."));
        ManitoAssignment assign = cr.getManitoAssignment();
        Long roomId = assign.getRoom().getRoomId();

        // 2) 룸User: 마니또, 마니띠 각각 찾아서
        RoomUser ruCaller = roomUserRepository
                .findByRoomIdAndUserId(roomId, callerUserId)
                .orElseThrow(() -> new RuntimeException("caller not found"));

        // 누가 caller인지에 따라 callee를 assign에서 바로 결정
        Long receiverId = ((callerUserId.equals(assign.getManito().getUser()))
                        ? assign.getManitee().getUser()
                        : assign.getManito().getUser()).getUserId();

        RoomUser ruCallee = roomUserRepository
                .findByRoomIdAndUserId(roomId, receiverId)
                .orElseThrow(() -> new RuntimeException("callee not found"));

        // 3) 두 사람 모두에 대해 voice_chat 레코드 생성
        VoiceChat vcCaller = VoiceChat.start(cr, ruCaller);
        VoiceChat vcCallee = VoiceChat.start(cr, ruCallee);
        voiceChatRepository.save(vcCaller);
        voiceChatRepository.save(vcCallee);
    }

    /**
     * 수신자가 수락 버튼을 눌렀을 때
     */
    public void acceptCall(Long chattingRoomId, Long callerId) {
        // 1. chattingRoomId가 같은 voice_chat 2건 조회
        List<VoiceChat> voiceChats = voiceChatRepository.findByChattingRoom_ChattingRoomId(chattingRoomId);

        // 2. 시간 세팅 및 active 설정
        for (VoiceChat vc : voiceChats) {
            vc.activate();
        }

        // 3. 저장
        voiceChatRepository.saveAll(voiceChats);
    }

    public void rejectCall(Long chattingRoomId, Long callerId) {
        log.info("▶▶ CALL_REJECTED 브로드캐스트 to /topic/call/{}", callerId);
        // 1) 같은 채팅룸의 두 건 조회
        List<VoiceChat> voiceChats = voiceChatRepository
                .findByChattingRoom_ChattingRoomId(chattingRoomId);

        // 2) 두 레코드를 모두 '비활성화' 처리
        for (VoiceChat vc : voiceChats) {
            vc.cancel();  // isActive=false
        }
        voiceChatRepository.saveAll(voiceChats);
    }

    /** 음성통화 종료 */
    public void endCall(Long chattingRoomId, Long userId) {
        // 1) 같은 채팅룸의 두 건 조회
        List<VoiceChat> voiceChats = voiceChatRepository
                .findByChattingRoom_ChattingRoomId(chattingRoomId);

        // 2) endNow() 호출해서 endedAt, durationSec, isActive=false 처리
        for (VoiceChat vc : voiceChats) {
            vc.endNow();
        }
        voiceChatRepository.saveAll(voiceChats);
    }
}
