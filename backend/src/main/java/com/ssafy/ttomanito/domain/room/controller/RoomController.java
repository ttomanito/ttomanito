package com.ssafy.ttomanito.domain.room.controller;

import com.ssafy.ttomanito.domain.room.dto.request.CreateRoomRequest;
import com.ssafy.ttomanito.domain.room.dto.request.SetUserMessageRequest;
import com.ssafy.ttomanito.domain.room.dto.response.ParticipantResponse;
import com.ssafy.ttomanito.domain.room.dto.response.RoomInfoResponse;
import com.ssafy.ttomanito.domain.room.entity.UserRoomStatus;
import com.ssafy.ttomanito.domain.room.service.RoomService;
import com.ssafy.ttomanito.domain.room.service.RoomUserService;
import com.ssafy.ttomanito.global.security.jwt.JwtProvider;
import com.ssafy.ttomanito.global.security.userdetails.JwtUserDetails;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/room")
@RequiredArgsConstructor
@Tag(name = "방", description = "방 관리 API")
public class RoomController {

    private final RoomService roomService;
    private final RoomUserService roomUserService;

    private final SimpMessagingTemplate messagingTemplate;  // ✅ 추가
    private final JwtProvider jwtProvider;


    @Operation(
            summary = "사용자 상태 여부 확인",
            description = "현재 로그인한 사용자에 대해 게임중인지 대기방에있는지 아무것도 아닌지 확인",
            security = @SecurityRequirement(name = "bearer-key") // JWT 인증 필요 시
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "대기방에 사용자가 있으면 IN_WAITING, 게임방에 사용자가 있으면 IN_GAME,둘다 없으면 IN_NONE 중 하나 반환-> 이 경우 대기방진입"),
            @ApiResponse(responseCode = "401", description = "인증 실패 (토큰 없음/만료)"),
            @ApiResponse(responseCode = "500", description = "서버 내부 오류")
    })
    @GetMapping("/check")
    public ResponseEntity<UserRoomStatus> checkUserInRoom(@Parameter(hidden = true) HttpServletRequest request,
                                                          @AuthenticationPrincipal JwtUserDetails principal) {
        Long userId = principal.getUserId();
        UserRoomStatus status = roomService.getUserRoomStatusEnum(userId);
        return ResponseEntity.ok(status);

    }


    @Operation(
            summary = "방 생성",
            description = "새 방을 생성하고 생성된 방 정보를 반환합니다.",
            security = @SecurityRequirement(name = "bearer-key")
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "생성 성공", content = @Content(schema = @Schema(implementation = RoomInfoResponse.class))),
            @ApiResponse(responseCode = "400", description = "잘못된 요청"),
            @ApiResponse(responseCode = "401", description = "인증 실패"),
            @ApiResponse(responseCode = "403", description = "인가 실패"),
            @ApiResponse(responseCode = "500", description = "서버 오류")
    })
    @PostMapping
    public ResponseEntity<RoomInfoResponse> create(
            @RequestBody CreateRoomRequest req,
            @AuthenticationPrincipal JwtUserDetails user
    ) {
        RoomInfoResponse resp = roomService.createRoom(req, user.getUserId());
        return ResponseEntity.ok(resp);
    }

    @Operation(
            summary = "방 종료 (방장만)",
            description = "방장이 방을 종료하고 상태는 NOT_STARTED -> NONE, WebSocket으로 브로드캐스트합니다.",
            security = @SecurityRequirement(name = "bearer-key")
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "종료 성공"),
            @ApiResponse(responseCode = "401", description = "인증 실패"),
            @ApiResponse(responseCode = "403", description = "권한 없음"),
            @ApiResponse(responseCode = "500", description = "서버 오류")
    })
    @PostMapping("/exit")
    public ResponseEntity<Void> hostExit(@AuthenticationPrincipal JwtUserDetails user) {
        roomService.closeRoomByCreatorId(user.getUserId());
        return ResponseEntity.ok().build();
    }

    @Operation(
            summary = "방 정보 조회",
            description = "주어진 roomId의 방 정보를 반환합니다."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "조회 성공", content = @Content(schema = @Schema(implementation = RoomInfoResponse.class))),
            @ApiResponse(responseCode = "404", description = "방 없음"),
            @ApiResponse(responseCode = "500", description = "서버 오류")
    })
    @GetMapping("/{roomId}")
    public ResponseEntity<RoomInfoResponse> info(@PathVariable Long roomId) {
        RoomInfoResponse resp = roomService.getRoomInfo(roomId);
        return ResponseEntity.ok(resp);
    }

    @Operation(
            summary = "참여자 목록 조회",
            description = "참여자 목록을 반환합니다."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "조회 성공", content = @Content(schema = @Schema(implementation = ParticipantResponse.class))),
            @ApiResponse(responseCode = "404", description = "방 없음"),
            @ApiResponse(responseCode = "500", description = "서버 오류")
    })
    @GetMapping("/{roomId}/participants")
    public ResponseEntity<List<ParticipantResponse>> participants(@PathVariable Long roomId) {
        List<ParticipantResponse> list = roomService.getParticipants(roomId);
        return ResponseEntity.ok(list);
    }

    @Operation(
            summary = "상태 메시지 작성 및 입장",
            description = "메시지와 함께 방에 입장 처리하고 WebSocket으로 브로드캐스트합니다.",
            security = @SecurityRequirement(name = "bearer-key")
    )
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "처리 성공"),
            @ApiResponse(responseCode = "400", description = "잘못된 요청"),
            @ApiResponse(responseCode = "401", description = "인증 실패"),
            @ApiResponse(responseCode = "403", description = "인가 실패"),
            @ApiResponse(responseCode = "404", description = "방 또는 사용자 없음"),
            @ApiResponse(responseCode = "500", description = "서버 오류")
    })
    @PostMapping("/{roomId}/message")
    public ResponseEntity<Void> setUserMessage(
            @PathVariable Long roomId,
            @RequestBody SetUserMessageRequest req,
            @AuthenticationPrincipal JwtUserDetails user
    ) {
        roomUserService.enterWithMessage(roomId, user.getUserId(), req.message());
        return ResponseEntity.noContent().build();
    }


    @Operation(
            summary = "방 나가기",
            description = "참여 중인 방에서 나갑니다.",
            security = @SecurityRequirement(name = "bearer-key")
    )
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "나가기 성공"),
            @ApiResponse(responseCode = "401", description = "인증 실패"),
            @ApiResponse(responseCode = "404", description = "방 또는 사용자 없음"),
            @ApiResponse(responseCode = "500", description = "서버 오류")
    })
    @DeleteMapping("/{roomId}/exit")
    public ResponseEntity<Void> exitRoom(
            @PathVariable Long roomId,
            @AuthenticationPrincipal JwtUserDetails user
    ) {
        roomUserService.exit(roomId, user.getUserId());
        return ResponseEntity.noContent().build();
    }


    @Operation(
            summary = "참여자 강퇴",
            description = "방장이 특정 참여자를 강퇴합니다.",
            security = @SecurityRequirement(name = "bearer-key")
    )
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "강퇴 성공"),
            @ApiResponse(responseCode = "400", description = "잘못된 요청"),
            @ApiResponse(responseCode = "403", description = "방장 권한 없음"),
            @ApiResponse(responseCode = "500", description = "서버 오류")
    })
    @DeleteMapping("/{roomId}/participants/{targetUserId}")
    public ResponseEntity<Void> kickParticipant(
            @PathVariable Long roomId,
            @PathVariable Long targetUserId,
            @AuthenticationPrincipal JwtUserDetails user
    ) {
        roomService.kick(roomId, user.getUserId(), targetUserId);
        return ResponseEntity.noContent().build();
    }

    @Operation(
            summary = "게임 시작",
            description = "방장이 게임을 시작하고 매칭을 수행합니다.",
            security = @SecurityRequirement(name = "bearer-key")
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "시작 성공"),
            @ApiResponse(responseCode = "400", description = "참여자 수 부족"),
            @ApiResponse(responseCode = "403", description = "권한 없음"),
            @ApiResponse(responseCode = "404", description = "방 없음"),
            @ApiResponse(responseCode = "500", description = "서버 오류")
    })
    @PostMapping("/{roomId}/start")
    public ResponseEntity<Void> startGame(
            @PathVariable Long roomId,
            @AuthenticationPrincipal JwtUserDetails user
    ) {
        roomService.startGame(roomId, user.getUserId());
        return ResponseEntity.ok().build();
    }

    @Operation(
            summary = "방장 여부 확인",
            description = "로그인 사용자가 방장인지 확인합니다.",
            security = @SecurityRequirement(name = "bearer-key")
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "true: 방장, false: 아님", content = @Content(schema = @Schema(type = "boolean"))),
            @ApiResponse(responseCode = "500", description = "서버 오류")
    })
    @GetMapping("/creator")
    public ResponseEntity<Boolean> isCreator(
            @AuthenticationPrincipal JwtUserDetails user
    ) {
        boolean isCreator = roomService.checkCreator(user.getUserId());
        return ResponseEntity.ok(isCreator);
    }

    @Operation(
            summary = "내 활성 방 ID 조회",
            description = "참여 중인 활성 방(NOT_STARTED / IN_PROGRESS)의 roomId 반환. 없으면 404",
            security = @SecurityRequirement(name = "bearer-key")
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "roomId", content = @Content(schema = @Schema(type = "integer", format = "int64"))),
            @ApiResponse(responseCode = "404", description = "활성 방 없음")
    })
    @GetMapping("/roomId")
    public ResponseEntity<Long> getMyRoomId(
            @AuthenticationPrincipal JwtUserDetails user
    ) {
        Long roomId = roomService.findMyActiveRoomId(user.getUserId());
        return ResponseEntity.ok(roomId); // 없으면 service에서 예외 터뜨림
    }
}