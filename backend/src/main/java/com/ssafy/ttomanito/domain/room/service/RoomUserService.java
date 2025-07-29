package com.ssafy.ttomanito.domain.room.service;

import com.ssafy.ttomanito.domain.room.dto.response.WaitingEventMessage;
import com.ssafy.ttomanito.domain.room.dto.response.WaitingMessage;
import com.ssafy.ttomanito.domain.room.entity.RoomUser;
import com.ssafy.ttomanito.domain.room.repository.RoomUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class RoomUserService {

    private final RoomUserRepository roomUserRepository;
    private final SimpMessagingTemplate messagingTemplate;

    /**
     * 상태메시지 작성 + 대기방 입장 처리 (room_user insert + 소켓 broadcast)
     */
    public void enterWithMessage(Long roomId, Long userId, String message) {
        RoomUser roomUser = roomUserRepository.findByRoomIdAndUserId(roomId, userId)
                .orElse(null);

        if (roomUser == null) {
            // 처음 입장인 경우
            roomUser = RoomUser.of(roomId, userId);
        }

        roomUser.setStatusMessage(message);
        roomUserRepository.save(roomUser); // 새로 만들었거나 업데이트

        // ✅ 소켓 브로드캐스트
        WaitingMessage msg = WaitingMessage.builder()
                .roomId(roomId)
                .userId(userId)
                .statusMessage(message)
                .type(WaitingMessage.MessageType.ENTER)
                .build();

        messagingTemplate.convertAndSend("/topic/waiting/" + roomId, msg);
    }

    /**
     * 초대링크 → “참가하기” 버튼 누르면 실행
     * 메시지 작성 전이라 insert는 안 하고, 조건 검사만
     */
    @Transactional(readOnly = true)
    public void prepareEnter(Long roomId, Long userId) {
        // 이미 입장했는지 확인 (중복 방지용)
        boolean exists = roomUserRepository.existsByRoomIdAndUserId(roomId, userId);
        if (exists) throw new IllegalStateException("이미 이 방에 참여했습니다.");
    }
    public boolean isUserInRoom(Long roomId, Long userId) {
        // RoomUser 엔티티를 통해 해당 방에 사용자가 존재하는지 확인
        return roomUserRepository.existsByRoomIdAndUserId(roomId, userId);
    }

    @Transactional
    public void exit(Long roomId, Long userId) {
        // room_user 테이블에서 해당 유저 삭제
        roomUserRepository.deleteByRoomIdAndUserId(roomId, userId);

        // 퇴장 브로드캐스트 (선택)
        messagingTemplate.convertAndSend("/topic/waiting/" + roomId,
                new WaitingEventMessage(roomId, userId, "EXIT"));
    }
}
