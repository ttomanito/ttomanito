package com.ssafy.ttomanito.domain.room.controller;

import com.ssafy.ttomanito.domain.room.dto.request.CreateRoomRequest;
import com.ssafy.ttomanito.domain.room.dto.request.SetUserMessageRequest;
import com.ssafy.ttomanito.domain.room.dto.response.ParticipantResponse;
import com.ssafy.ttomanito.domain.room.dto.response.RoomInfoResponse;
import com.ssafy.ttomanito.domain.room.entity.Room;
import com.ssafy.ttomanito.domain.room.service.RoomService;
import com.ssafy.ttomanito.domain.room.service.RoomUserService;
import com.ssafy.ttomanito.global.security.jwt.JwtProvider;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import com.ssafy.ttomanito.domain.room.entity.RoomStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/room")
@RequiredArgsConstructor
public class RoomController {

    private final RoomService roomService;
    private final RoomUserService roomUserService;

    private final SimpMessagingTemplate messagingTemplate;  // ✅ 추가
    private final JwtProvider jwtProvider;


    // 사용자가 대기방 또는 진행 중인 방에 참여 중인지 확인하는 API
    @GetMapping("/check")
    public boolean checkUserInRoom(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId"); // ✅ 여기서 직접 꺼냄

        return roomService.isUserInProgressOrWaiting(userId);
    }
  /*  @PostMapping
    public ResponseEntity<?> create(@RequestBody CreateRoomRequest req,
                                    @RequestHeader("userId") Long userId) {
        // JWT 인증 생략하고 userId 직접 받기
        System.out.println("✅ userId: " + userId);  // 디버깅 로그

        RoomInfoResponse response = roomService.createRoom(req, userId);
        return ResponseEntity.ok(response);
    }*/
  @PostMapping
  public ResponseEntity<?> create(@RequestBody CreateRoomRequest req,
                                  HttpServletRequest request) {
      Long userId = (Long) request.getAttribute("userId");  // ✅ JWT 필터에서 setAttribute로 저장된 값
      System.out.println("✅ userId: " + userId);

      RoomInfoResponse response = roomService.createRoom(req, userId);
      return ResponseEntity.ok(response);
  }
 /*   @PostMapping("/exit")
    public ResponseEntity<?> hostExit(@RequestHeader("userId") Long userId) {
        // creatorId 기반으로 방 조회 후 종료
        roomService.closeRoomByCreatorId(userId);
        return ResponseEntity.ok("Room closed by host.");
    }*/
 @PostMapping("/exit")
 public ResponseEntity<?> hostExit(HttpServletRequest request) {
     Long userId = (Long) request.getAttribute("userId");  // ✅ JwtAuthenticationFilter에서 세팅됨
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
                               HttpServletRequest request,
                               @RequestBody SetUserMessageRequest req) {
        Long userId = (Long) request.getAttribute("userId");  // ✅ JWT 필터에서 설정됨
        roomUserService.enterWithMessage(roomId, userId, req.message());
    }

    // 5. 초대링크 진입 후 “참가하기” 버튼 눌렀을 때 호출
    @PostMapping("/{roomId}/enter")
    public void prepareEnter(@PathVariable Long roomId,
                             HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");  // ✅ 필터에서 세팅된 값

        // 1. 방 상태 확인
        Room room = roomService.findById(roomId);
        if (!room.getStatus().equals(RoomStatus.NOT_STARTED)) {
            throw new IllegalStateException("Cannot join. Room is not in NOT_STARTED state.");
        }

        // 방에 참여할 준비 수행
        roomUserService.prepareEnter(roomId, userId);
    }

    //참여자 나가기
    @DeleteMapping("/{roomId}/exit")
    public void exitRoom(@PathVariable Long roomId,
                         HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");  // ✅ JwtAuthenticationFilter에서 설정됨
        roomUserService.exit(roomId, userId);
    }

    //방장권한 강퇴
    @DeleteMapping("/{roomId}/participants")
    public void kickParticipant(@PathVariable Long roomId,
                                @RequestParam Long targetUserId,
                                HttpServletRequest request) {
        Long hostId = (Long) request.getAttribute("userId");  // ✅ JWT 필터에서 추출된 userId
        roomService.kick(roomId, hostId, targetUserId);
    }

    //마피아 게임시작
    @PostMapping("/{roomId}/start")
    public ResponseEntity<?> startGame(@PathVariable Long roomId,
                                       HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");  // ✅ JwtAuthenticationFilter에서 세팅됨
        roomService.startGame(roomId, userId);
        return ResponseEntity.ok().build();
    }
}