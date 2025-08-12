package com.ssafy.ttomanito.domain.room.controller;

import com.ssafy.ttomanito.domain.room.dto.response.RoomUserIdResponse;
import com.ssafy.ttomanito.domain.room.service.RoomUserService;
import com.ssafy.ttomanito.global.security.userdetails.JwtUserDetails;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/room-user")
@RequiredArgsConstructor
@Tag(name = "방-사용자", description = "방-사용자 관련 API")
public class RoomUserController {

    private final RoomUserService roomUserService;

    @Operation(
            summary = "특정 방에서 내 roomUserId 조회",
            description = "path의 roomId에서 현재 로그인 사용자의 roomUserId를 반환합니다.",
            security = @SecurityRequirement(name = "bearer-key")
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "조회 성공",
                    content = @Content(schema = @Schema(implementation = RoomUserIdResponse.class))),
            @ApiResponse(responseCode = "404", description = "해당 방에 사용자 참여 정보 없음"),
            @ApiResponse(responseCode = "401", description = "인증 실패"),
            @ApiResponse(responseCode = "500", description = "서버 오류")
    })
    @GetMapping("/{roomId}/me")
    public ResponseEntity<RoomUserIdResponse> getMyRoomUserIdInRoom(
            @PathVariable Long roomId,
            @AuthenticationPrincipal @Parameter(hidden = true) JwtUserDetails user
    ) {
        Long roomUserId = roomUserService.getRoomUserId(roomId, user.getUserId());
        return ResponseEntity.ok(new RoomUserIdResponse(roomUserId));
    }

    @Operation(
            summary = "내 활성 방에서 roomUserId 조회",
            description = "사용자가 참여 중인 활성 방(NOT_STARTED/IN_PROGRESS)에서의 roomUserId를 반환합니다.",
            security = @SecurityRequirement(name = "bearer-key")
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "조회 성공",
                    content = @Content(schema = @Schema(implementation = RoomUserIdResponse.class))),
            @ApiResponse(responseCode = "404", description = "활성 방 없음 또는 참여 정보 없음"),
            @ApiResponse(responseCode = "401", description = "인증 실패"),
            @ApiResponse(responseCode = "500", description = "서버 오류")
    })
    @GetMapping("/me/active")
    public ResponseEntity<RoomUserIdResponse> getMyRoomUserIdInActiveRoom(
            @AuthenticationPrincipal @Parameter(hidden = true) JwtUserDetails user
    ) {
        Long roomUserId = roomUserService.getRoomUserIdInActiveRoom(user.getUserId());
        return ResponseEntity.ok(new RoomUserIdResponse(roomUserId));
    }

    @Operation(
            summary = "특정 userId의 roomUserId 조회",
            description = "path의 roomId와 targetUserId로 특정 사용자의 roomUserId를 반환합니다.",
            security = @SecurityRequirement(name = "bearer-key")
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "조회 성공",
                    content = @Content(schema = @Schema(implementation = RoomUserIdResponse.class))),
            @ApiResponse(responseCode = "404", description = "해당 방에 사용자 참여 정보 없음"),
            @ApiResponse(responseCode = "401", description = "인증 실패"),
            @ApiResponse(responseCode = "500", description = "서버 오류")
    })
    @GetMapping("/{roomId}/{userId}")
    public ResponseEntity<RoomUserIdResponse> getRoomUserIdForUser(
            @PathVariable Long roomId,
            @PathVariable Long userId
    ) {
        Long roomUserId = roomUserService.getRoomUserId(roomId, userId);
        return ResponseEntity.ok(new RoomUserIdResponse(roomUserId));
    }

    @Operation(
            summary = "특정 userId의 활성 방 roomUserId 조회",
            description = "특정 사용자가 참여 중인 활성 방(NOT_STARTED/IN_PROGRESS)에서의 roomUserId를 반환합니다.",
            security = @SecurityRequirement(name = "bearer-key")
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "조회 성공",
                    content = @Content(schema = @Schema(implementation = RoomUserIdResponse.class))),
            @ApiResponse(responseCode = "404", description = "활성 방 없음 또는 참여 정보 없음"),
            @ApiResponse(responseCode = "401", description = "인증 실패"),
            @ApiResponse(responseCode = "500", description = "서버 오류")
    })
    @GetMapping("/{userId}/active")
    public ResponseEntity<RoomUserIdResponse> getRoomUserIdInActiveRoomForUser(
            @PathVariable Long userId
    ) {
        Long roomUserId = roomUserService.getRoomUserIdInActiveRoom(userId);
        return ResponseEntity.ok(new RoomUserIdResponse(roomUserId));
    }
}
