package com.ssafy.ttomanito.domain.room.controller;

import com.ssafy.ttomanito.domain.room.dto.request.CreateRoomRequest;
import com.ssafy.ttomanito.domain.room.dto.request.SetUserMessageRequest;
import com.ssafy.ttomanito.domain.room.dto.response.ParticipantResponse;
import com.ssafy.ttomanito.domain.room.dto.response.RoomInfoResponse;
import com.ssafy.ttomanito.domain.room.entity.Room;
import com.ssafy.ttomanito.domain.room.service.RoomService;
import com.ssafy.ttomanito.domain.room.service.RoomUserService;
import com.ssafy.ttomanito.security.JwtService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import com.ssafy.ttomanito.domain.room.entity.RoomStatus;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/room")
@RequiredArgsConstructor
public class RoomController {

    private final RoomService roomService;
    private final RoomUserService roomUserService;
    private final JwtService jwtService;  // JWT 서비스 (토큰 검증 및 사용자 ID 추출)
    private final SimpMessagingTemplate messagingTemplate;  // ✅ 추가

    // 사용자가 대기방 또는 진행 중인 방에 참여 중인지 확인하는 API
    @GetMapping("/check")
    public boolean checkUserInRoom(@RequestHeader("userId") Long userId) {
        // 사용자 ID로 방 참여 상태 확인
        return roomService.isUserInProgressOrWaiting(userId);  // 참여 중이면 true, 아니면 false 반환
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody CreateRoomRequest req,
                                    @RequestHeader("userId") Long userId) {
        // JWT 인증 생략하고 userId 직접 받기
        System.out.println("✅ userId: " + userId);  // 디버깅 로그
     /*   // 게임 중인 경우
        if (roomService.isUserInProgressOrWaiting(userId)) {
            return ResponseEntity
                    .status(HttpStatus.CONFLICT)  // 409
                    .body("이미 게임 중이거나 대기방에 있습니다.");
        }*/


        RoomInfoResponse response = roomService.createRoom(req, userId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/exit")
    public ResponseEntity<?> hostExit(@RequestHeader("userId") Long userId) {
        // creatorId 기반으로 방 조회 후 종료
        roomService.closeRoomByCreatorId(userId);
        return ResponseEntity.ok("Room closed by host.");
    }

    // 2. 방 정보 조회
    @GetMapping("/{roomId}")
    public RoomInfoResponse info(@PathVariable Long roomId) {
        return roomService.getRoomInfo(roomId);
    }

    // 3. 참여자 목록 조회
    @GetMapping("/{roomId}/participants")
    public List<ParticipantResponse> participants(@PathVariable Long roomId) {
        return roomService.getParticipants(roomId);
    }

    // 4. 상태메시지 작성 + 입장 처리
    @PostMapping("/{roomId}/message")
    public void setUserMessage(@PathVariable Long roomId,
                               @RequestHeader("userId") Long userId,
                               @RequestBody SetUserMessageRequest request) {
        roomUserService.enterWithMessage(roomId, userId, request.message());
    }

    // 5. 초대링크 진입 후 “참가하기” 버튼 눌렀을 때 호출
    @PostMapping("/{roomId}/enter")
    public void prepareEnter(@PathVariable Long roomId,
                             @RequestHeader("userId") Long userId) {

        // 1. 방 상태 확인
        Room room = roomService.findById(roomId);
        if (!room.getStatus().equals(RoomStatus.NOT_STARTED)) {
            throw new IllegalStateException("Cannot join. Room is not in NOT_STARTED state.");
        }


        // 방에 참여할 준비 수행
        roomUserService.prepareEnter(roomId, userId);
    }

    @DeleteMapping("/{roomId}/exit")
    public void exitRoom(@PathVariable Long roomId,
                         @RequestHeader("userId") Long userId) {



        // 2. 퇴장 처리
        roomUserService.exit(roomId, userId);
    }
    @DeleteMapping("/{roomId}/participants")
    public void kickParticipant(@PathVariable Long roomId,
                                @RequestParam Long targetUserId,
                                @RequestHeader("userId") Long hostId) {
        roomService.kick(roomId, hostId, targetUserId);
    }
    @PostMapping("/{roomId}/start")
    public ResponseEntity<?> startGame(@PathVariable Long roomId,
                                       @RequestHeader("userId") Long userId) {
        roomService.startGame(roomId, userId);
        return ResponseEntity.ok().build();
    }
}