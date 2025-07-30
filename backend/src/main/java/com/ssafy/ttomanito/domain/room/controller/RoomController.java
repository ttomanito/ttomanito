package com.ssafy.ttomanito.domain.room.controller;

import com.ssafy.ttomanito.domain.room.dto.request.CreateRoomRequest;
import com.ssafy.ttomanito.domain.room.dto.request.SetUserMessageRequest;
import com.ssafy.ttomanito.domain.room.dto.response.ParticipantResponse;
import com.ssafy.ttomanito.domain.room.dto.response.RoomInfoResponse;
import com.ssafy.ttomanito.domain.room.entity.Room;
import com.ssafy.ttomanito.domain.room.service.RoomService;
import com.ssafy.ttomanito.domain.room.service.RoomUserService;
import com.ssafy.ttomanito.global.security.jwt.JwtProvider;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import io.swagger.v3.oas.annotations.Parameter;
import lombok.extern.slf4j.Slf4j;
import com.ssafy.ttomanito.domain.room.entity.RoomStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
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


    @Operation(
            summary = "사용자 참여 여부 확인",
            description = "현재 로그인한 사용자가 대기 중이거나 진행 중인 방에 참여하고 있는지 여부를 확인합니다.",
            security = @SecurityRequirement(name = "bearer-key") // JWT 인증 필요 시
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "정상 처리 (true: 참여 중, false: 미참여)",
                    content = @Content(
                            mediaType = "application/json",
                            schema = @Schema(implementation = Boolean.class),
                            examples = {
                                    @ExampleObject(name = "participating", value = "true"),
                                    @ExampleObject(name = "notParticipating", value = "false")
                            }
                    )
            ),
            @ApiResponse(responseCode = "401", description = "인증 실패 (토큰 없음/만료)"),
            @ApiResponse(responseCode = "403", description = "인가 실패"),
            @ApiResponse(responseCode = "500", description = "서버 내부 오류")
    })
    @GetMapping("/check")
    public boolean checkUserInRoom(@Parameter(hidden = true) HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");

        return roomService.isUserInProgressOrWaiting(userId);
    }

    @Operation(
            summary = "방 생성",
            description = "사용자가 새로운 방을 생성합니다. JWT 토큰에서 사용자 ID를 추출하여 방을 생성하고, 생성된 방 정보를 반환합니다.",
            security = @SecurityRequirement(name = "bearer-key")
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "401", description = "인증 실패 (토큰 없음/만료)"),
            @ApiResponse(responseCode = "403", description = "인가 실패"),
            @ApiResponse(responseCode = "500", description = "서버 내부 오류")
    })
  @PostMapping
  public ResponseEntity<?> create(@RequestBody CreateRoomRequest req,
                                  HttpServletRequest request) {
      Long userId = (Long) request.getAttribute("userId");
      System.out.println("✅ userId: " + userId);

      RoomInfoResponse response = roomService.createRoom(req, userId);
      return ResponseEntity.ok(response);
  }

    @Operation(
            summary = "방장 퇴장 (방 종료)",
            description = "방장이 방을 종료합니다. JWT 인증이 필요하며 WebSocket으로 방이 종료된 것에 대해 메시지를 브로드캐스트합니다.",
            security = @SecurityRequirement(name = "bearer-key")
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "방이 정상적으로 종료되었습니다."),
            @ApiResponse(responseCode = "401", description = "인증 실패 (토큰 없음/만료)"),
            @ApiResponse(responseCode = "403", description = "인가 실패"),
            @ApiResponse(responseCode = "500", description = "서버 내부 오류")
    })
 @PostMapping("/exit")
 public ResponseEntity<?> hostExit(HttpServletRequest request) {
     Long userId = (Long) request.getAttribute("userId");
     roomService.closeRoomByCreatorId(userId);
     return ResponseEntity.ok("Room closed by host.");
 }

    @Operation(
            summary = "방 정보 조회",
            description = "방 ID를 기반으로 해당 방의 상세 정보를 조회합니다. 초대받을 시 참여자가 보게 될 정보"
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "방 정보 조회 성공"),
            @ApiResponse(responseCode = "404", description = "해당 ID의 방이 존재하지 않음"),
            @ApiResponse(responseCode = "500", description = "서버 내부 오류")
    })
    @GetMapping("/{roomId}")
    public RoomInfoResponse info(@PathVariable Long roomId) {
        return roomService.getRoomInfo(roomId);
    }

    @Operation(
            summary = "참여자 목록 조회",
            description = "특정 방에 참여 중인 사용자들의 정보를 조회합니다."

    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "참여자 목록 조회 성공"),
            @ApiResponse(responseCode = "404", description = "방을 찾을 수 없음"),
            @ApiResponse(responseCode = "500", description = "서버 내부 오류")
    })
    @GetMapping("/{roomId}/participants")
    public List<ParticipantResponse> participants(@PathVariable Long roomId) {
        return roomService.getParticipants(roomId);
    }

    @Operation(
            summary = "상태 메시지 작성 및 입장 처리",
            description = "사용자가 방에 입장하면서 상태 메시지를 함께 등록하며 WebSocket으로 방 참여에 대해 브로드캐스트합니다.",
            security = @SecurityRequirement(name = "bearer-key")
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "상태 메시지 등록 및 입장 처리 완료"),
            @ApiResponse(responseCode = "400", description = "요청 값이 유효하지 않음"),
            @ApiResponse(responseCode = "401", description = "인증 실패 (토큰 없음/만료)"),
            @ApiResponse(responseCode = "403", description = "인가 실패"),
            @ApiResponse(responseCode = "404", description = "방 또는 사용자 정보를 찾을 수 없음"),
            @ApiResponse(responseCode = "500", description = "서버 내부 오류")
    })
    @PostMapping("/{roomId}/message")
    public void setUserMessage(@PathVariable Long roomId,
                               HttpServletRequest request,
                               @RequestBody SetUserMessageRequest req) {
        Long userId = (Long) request.getAttribute("userId");
        roomUserService.enterWithMessage(roomId, userId, req.message());
    }

    @Operation(
            summary = "참가하기 버튼 클릭 처리",
            description = "초대링크 진입 후 참가하기 버튼을 누르면 호출되며, 방 상태 확인 후 입장 준비를 수행합니다.",
            security = @SecurityRequirement(name = "bearer-key")
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "입장 준비 완료"),
            @ApiResponse(responseCode = "400", description = "방 상태가 NOT_STARTED가 아님"),
            @ApiResponse(responseCode = "401", description = "인증 실패 (토큰 없음/만료)"),
            @ApiResponse(responseCode = "403", description = "인가 실패"),
            @ApiResponse(responseCode = "404", description = "방을 찾을 수 없음"),
            @ApiResponse(responseCode = "500", description = "서버 내부 오류")
    })
    @PostMapping("/{roomId}/enter")
    public void prepareEnter(@PathVariable Long roomId,
                             HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");

        // 1. 방 상태 확인
        Room room = roomService.findById(roomId);
        if (!room.getStatus().equals(RoomStatus.NOT_STARTED)) {
            throw new IllegalStateException("Cannot join. Room is not in NOT_STARTED state.");
        }

        // 방에 참여할 준비 수행
        roomUserService.prepareEnter(roomId, userId);
    }

    @Operation(
            summary = "방 나가기",
            description = "사용자가 참여 중인 방에서 나갑니다.",
            security = @SecurityRequirement(name = "bearer-key")
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "방에서 성공적으로 나감"),
            @ApiResponse(responseCode = "401", description = "인증 실패 (토큰 없음/만료)"),
            @ApiResponse(responseCode = "403", description = "인가 실패"),
            @ApiResponse(responseCode = "404", description = "방 또는 사용자 정보를 찾을 수 없음"),
            @ApiResponse(responseCode = "500", description = "서버 내부 오류")
    })
    @DeleteMapping("/{roomId}/exit")
    public void exitRoom(@PathVariable Long roomId,
                         HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        roomUserService.exit(roomId, userId);
    }

    @Operation(
            summary = "참여자 강퇴",
            description = "방장이 특정 참여자를 강퇴합니다.",
            security = @SecurityRequirement(name = "bearer-key")
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "강퇴 성공"),
            @ApiResponse(responseCode = "400", description = "요청 파라미터 오류"),
            @ApiResponse(responseCode = "401", description = "인증 실패 (토큰 없음/만료)"),
            @ApiResponse(responseCode = "403", description = "인가 실패 (방장 아님)"),
            @ApiResponse(responseCode = "404", description = "대상 사용자를 찾을 수 없음"),
            @ApiResponse(responseCode = "500", description = "서버 내부 오류")
    })
    @DeleteMapping("/{roomId}/participants")
    public void kickParticipant(@PathVariable Long roomId,
                                @RequestParam Long targetUserId,
                                HttpServletRequest request) {
        Long hostId = (Long) request.getAttribute("userId");
        roomService.kick(roomId, hostId, targetUserId);
    }

    @Operation(
            summary = "게임 시작",
            description = "방장이 게임을 시작합니다. 시작 시 참여자 수를 확인하고, 마니또 매칭을 수행하며, WebSocket으로 시작 메시지를 브로드캐스트합니다.",
            security = @SecurityRequirement(name = "bearer-key")
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "게임 시작 성공"),
            @ApiResponse(responseCode = "401", description = "인증 실패 (토큰 없음/만료)"),
            @ApiResponse(responseCode = "403", description = "인가 실패 (방장 아님)"),
            @ApiResponse(responseCode = "404", description = "방을 찾을 수 없음"),
            @ApiResponse(responseCode = "500", description = "서버 내부 오류")
    })
    @PostMapping("/{roomId}/start")
    public ResponseEntity<?> startGame(@PathVariable Long roomId,
                                       HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        roomService.startGame(roomId, userId);
        return ResponseEntity.ok().build();
    }
}