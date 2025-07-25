package com.ssafy.ttomanito.domain.room.controller;

import com.ssafy.ttomanito.domain.room.dto.request.CreateRoomRequest;
import com.ssafy.ttomanito.domain.room.dto.request.KickUserRequest;
import com.ssafy.ttomanito.domain.room.dto.request.SetUserMessageRequest;
import com.ssafy.ttomanito.domain.room.dto.response.ParticipantResponse;
import com.ssafy.ttomanito.domain.room.dto.response.RoomInfoResponse;
import com.ssafy.ttomanito.domain.room.service.RoomService;
import lombok.RequiredArgsConstructor;
import org.apache.coyote.BadRequestException;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/room")
@RequiredArgsConstructor
public class RoomController {

    private final RoomService roomService;

    @PostMapping
    public RoomInfoResponse create(@RequestBody CreateRoomRequest req, Principal principal) {
        Long creatorId = uid(principal);
        return roomService.createRoom(req, creatorId);
    }

    @GetMapping("/{roomId}/participants")
    public List<ParticipantResponse> participants(@PathVariable Long roomId) {
        return roomService.getParticipants(roomId);
    }

    @GetMapping("/{roomId}")
    public RoomInfoResponse info(@PathVariable Long roomId) {
        return roomService.getRoomInfo(roomId);
    }

    @DeleteMapping("/{roomId}/participants")
    public void kick(@PathVariable Long roomId,
                     @RequestBody KickUserRequest req,
                     Principal principal) {
        // TODO: 방장 권한 체크
        roomService.kick(roomId, req.targetUserId());
    }

    @PostMapping("/{roomId}/message")
    public void setUserMessage(@PathVariable Long roomId,
                               @RequestBody SetUserMessageRequest req,
                               Principal principal) throws BadRequestException {
        Long userId = uid(principal);
        roomService.setUserMessage(roomId, userId, req.message());
    }

    @PostMapping("/{roomId}/start")
    public void start(@PathVariable Long roomId, Principal principal) {
        // TODO: 방장 권한 체크
        roomService.startGame(roomId);
    }

    @PostMapping("/{roomId}/enter")
    public void enter(@PathVariable Long roomId, Principal principal) {
        Long userId = uid(principal);
        roomService.enterByHttp(roomId, userId);
    }

    @PostMapping("/{roomId}/exit")
    public void exit(@PathVariable Long roomId, Principal principal) {
        Long userId = uid(principal);
        roomService.exitByHttp(roomId, userId);
    }

    private Long uid(Principal p) {
        return Long.valueOf(p.getName());
    }
}

