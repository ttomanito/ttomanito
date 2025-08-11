package com.ssafy.ttomanito.domain.room.service;

import com.ssafy.ttomanito.domain.room.dto.response.WaitingEventMessage;
import com.ssafy.ttomanito.domain.room.dto.response.WaitingMessage;
import com.ssafy.ttomanito.domain.room.entity.Room;
import com.ssafy.ttomanito.domain.room.entity.RoomStatus;
import com.ssafy.ttomanito.domain.room.entity.RoomUser;
import com.ssafy.ttomanito.domain.room.repository.RoomRepository;
import com.ssafy.ttomanito.domain.room.repository.RoomUserRepository;
import com.ssafy.ttomanito.domain.user.entity.User;
import com.ssafy.ttomanito.domain.user.repository.UserRepository;
import com.ssafy.ttomanito.global.exception.BadRequestException;
import com.ssafy.ttomanito.global.exception.NotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
@RequiredArgsConstructor
public class RoomUserService {

    private final RoomUserRepository roomUserRepository;
    private final RoomRepository roomRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    /**
     * 상태메시지 작성 + 대기방 입장 처리 (room_user insert + 소켓 broadcast)
     */
    public void enterWithMessage(Long roomId, Long userId, String message) {
        System.out.println(">> enterWithMessage called: roomId=" + roomId
                + ", userId=" + userId + ", message=" + message);

        // 1) Room 존재 여부만 체크 (없으면 404)
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new NotFoundException("존재하지 않는 방입니다: " + roomId));

        // 2) User는 이미 검증되었으니, 프록시로만 참조
        User userProxy = userRepository.getReferenceById(userId);

        // 3) 항상 새 RoomUser 생성 & 메시지 세팅
        RoomUser newRoomUser = RoomUser.of(room, userProxy)
                .toBuilder()
                .statusMessage(message)
                .build();
        roomUserRepository.save(newRoomUser);

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
     * 대기방에서 나가기
     */
    public void exit(Long roomId, Long userId) {
        // 1) 대기방 존재/상태 확인
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new NotFoundException("해당 방에 해당하는 대기방이 없습니다."));
        if (room.getStatus() != RoomStatus.NOT_STARTED) { // ← 대기방 상태명에 맞게 수정
            throw new NotFoundException("해당 방에 해당하는 대기방이 없습니다.");
        }

        // 2) 대기방 내 유저 존재 확인
        RoomUser ru = roomUserRepository
                .findByRoom_roomIdAndUser_UserId(roomId, userId)
                .orElseThrow(() -> new NotFoundException("해당 대기방에 사용자가 없습니다."));

        roomUserRepository.deleteByRoom_roomIdAndUser_UserId(roomId, userId);

        // 퇴장 이벤트 브로드캐스트
        WaitingEventMessage evt = new WaitingEventMessage(roomId, userId, WaitingMessage.MessageType.EXIT);
        messagingTemplate.convertAndSend("/topic/waiting/" + roomId, evt);
    }
}
