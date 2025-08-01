package com.ssafy.ttomanito.domain.room.service;

import com.ssafy.ttomanito.domain.room.dto.response.WaitingEventMessage;
import com.ssafy.ttomanito.domain.room.dto.response.WaitingMessage;
import com.ssafy.ttomanito.domain.room.entity.Room;
import com.ssafy.ttomanito.domain.room.entity.RoomUser;
import com.ssafy.ttomanito.domain.room.repository.RoomRepository;
import com.ssafy.ttomanito.domain.room.repository.RoomUserRepository;
import com.ssafy.ttomanito.domain.user.entity.User;
import com.ssafy.ttomanito.domain.user.exception.UserNotFoundException;
import com.ssafy.ttomanito.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class RoomUserService {

    private final RoomUserRepository roomUserRepository;
    private final RoomRepository roomRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    /**
     * 상태메시지 작성 + 대기방 입장 처리 (room_user insert + 소켓 broadcast)
     */
    public void enterWithMessage(Long roomId, Long userId, String message) {
        // 1) Room/User 엔티티 로드 (없으면 예외)
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 방입니다: " + roomId));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(userId));

        // 2) 기존 RoomUser 조회, 없으면 새로 생성
        RoomUser roomUser = roomUserRepository
                .findByRoom_roomIdAndUser_UserId(roomId, userId)
                .orElse(RoomUser.of(room, user));

        // 3) 상태메시지 업데이트
        roomUser = roomUser.toBuilder()
                .statusMessage(message)
                .build();
        roomUserRepository.save(roomUser);

        // 4) 브로드캐스트
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
        boolean exists = roomUserRepository
                .existsByRoom_roomIdAndUser_UserId(roomId, userId);
        if (exists) {
            throw new IllegalStateException("이미 이 방에 참여했습니다.");
        }
    }

    /**
     * 해당 방에 사용자가 이미 들어와 있는지
     */
    @Transactional(readOnly = true)
    public boolean isUserInRoom(Long roomId, Long userId) {
        return roomUserRepository.existsByRoom_roomIdAndUser_UserId(roomId, userId);
    }

    /**
     * 대기방에서 퇴장 처리
     */
    public void exit(Long roomId, Long userId) {
        roomUserRepository.deleteByRoom_roomIdAndUser_UserId(roomId, userId);

        // 퇴장 이벤트 브로드캐스트
        WaitingEventMessage evt = new WaitingEventMessage(roomId, userId, "EXIT");
        messagingTemplate.convertAndSend("/topic/waiting/" + roomId, evt);
    }
}
