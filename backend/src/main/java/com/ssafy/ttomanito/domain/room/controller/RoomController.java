package com.ssafy.ttomanito.domain.room.controller;

import com.ssafy.ttomanito.domain.room.dto.request.CreateRoomRequest;
import com.ssafy.ttomanito.domain.room.dto.request.SetUserMessageRequest;
import com.ssafy.ttomanito.domain.room.dto.response.ParticipantResponse;
import com.ssafy.ttomanito.domain.room.dto.response.RoomInfoResponse;
import com.ssafy.ttomanito.domain.room.service.RoomService;
import com.ssafy.ttomanito.domain.room.service.RoomUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/room")
@RequiredArgsConstructor
public class RoomController {

    private final RoomService roomService;
    private final RoomUserService roomUserService;

    // 1. 방 생성
    @PostMapping
    public RoomInfoResponse create(@RequestBody CreateRoomRequest req,
                                   @RequestHeader("X-USER-ID") Long userId) {
        // userId가 곧 방장(creatorId)
        return roomService.createRoom(req, userId);
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
                               @RequestHeader("X-USER-ID") Long userId,
                               @RequestBody SetUserMessageRequest request) {
        roomUserService.enterWithMessage(roomId, userId, request.message());
    }
    // 5. 초대링크 진입 후 “참가하기” 버튼 눌렀을 때 호출
    @PostMapping("/{roomId}/enter")
    public void prepareEnter(@PathVariable Long roomId,
                             @RequestHeader("X-USER-ID") Long userId) {
        roomUserService.prepareEnter(roomId, userId);
    }






    private Long uid(Principal p) {
        return Long.valueOf(p.getName());
    }
}

