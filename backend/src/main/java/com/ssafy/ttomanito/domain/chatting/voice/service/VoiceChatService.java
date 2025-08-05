package com.ssafy.ttomanito.domain.chatting.voice.service;

import com.ssafy.ttomanito.domain.chatting.room.entity.ChattingRoom;
import com.ssafy.ttomanito.domain.chatting.room.repository.ChattingRepository;
import com.ssafy.ttomanito.domain.chatting.voice.dto.CallSignalDto;
import com.ssafy.ttomanito.domain.chatting.voice.entity.VoiceChat;
import com.ssafy.ttomanito.domain.chatting.voice.repository.VoiceChatRepository;
import com.ssafy.ttomanito.domain.manito.entity.ManitoAssignment;
import com.ssafy.ttomanito.domain.room.entity.RoomUser;
import com.ssafy.ttomanito.domain.room.repository.RoomUserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import lombok.extern.slf4j.XSlf4j;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class VoiceChatService {

    private final ChattingRepository chattingRepository;
    private final RoomUserRepository roomUserRepository;
    private final VoiceChatRepository voiceChatRepository;
    private final SimpMessagingTemplate messagingTemplate;


    @Transactional
    public void startCall(Long chattingRoomId, Long callerUserId) {
        log.info("▶▶ ENTER acceptCall", new RuntimeException("stack trace"));
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
        Long receiverId = (callerUserId.equals(assign.getManito().getUserId()))
                ? assign.getManitee().getUserId()
                : assign.getManito().getUserId();

        RoomUser ruCallee = roomUserRepository
                .findByRoomIdAndUserId(roomId, receiverId)
                .orElseThrow(() -> new RuntimeException("callee not found"));




        // 3) 두 사람 모두에 대해 voice_chat 레코드 생성
        VoiceChat vcCaller = VoiceChat.start(cr, ruCaller);
        VoiceChat vcCallee = VoiceChat.start(cr, ruCallee);
        voiceChatRepository.save(vcCaller);
        voiceChatRepository.save(vcCallee);

        log.info("▶▶ CALL_REQUEST 브로드캐스트 to /topic/call/{}", receiverId);
        // 4) Unicast → B에게만 CALL_REQUEST 푸시
        messagingTemplate.convertAndSend(
                "/topic/call/" + receiverId,
                new CallSignalDto(
                        "CALL_REQUEST",
                        chattingRoomId,
                        callerUserId,
                        ruCaller.getUser().getName()
                )
        );
    }

    /**
     * 수신자가 수락 버튼을 눌렀을 때
     */

    @Transactional
    public void acceptCall(Long chattingRoomId, Long callerId) {
        // 1. chattingRoomId가 같은 voice_chat 2건 조회
        List<VoiceChat> voiceChats = voiceChatRepository.findByChattingRoom_ChattingRoomId(chattingRoomId);



        // 2. 시간 세팅 및 active 설정
        LocalDateTime now = LocalDateTime.now();
        for (VoiceChat vc : voiceChats) {
            vc.activate(now);
        }

        // 3. 저장
        voiceChatRepository.saveAll(voiceChats);

        // ✅ callerId를 받은 거니까 → 나머지 한 명이 receiver
        Long receiverId = voiceChats.stream()
                .map(vc -> vc.getRoomUser().getUser().getUserId())
                .filter(id -> !id.equals(callerId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Receiver not found"));

        // ✅ caller에게 메시지 보내기
        Map<String, Object> msg = new HashMap<>();
        msg.put("type", "CALL_ACCEPTED");
        msg.put("chatroomId", chattingRoomId);
        msg.put("receiverId", receiverId);  // ✅ 수신자
        msg.put("callerId", callerId);      // ✅ 발신자

        log.info("▶▶ CALL_ACCEPTED 브로드캐스트 to /topic/call/{}", callerId);
        messagingTemplate.convertAndSend(
                "/topic/call/" + callerId,         // UserDestinationPrefix + queue 경로
                msg       );               // payload);
    }
}
