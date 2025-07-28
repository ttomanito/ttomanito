package com.ssafy.ttomanito.domain.room.controller;

import com.ssafy.ttomanito.domain.room.dto.request.CreateRoomRequest;
import com.ssafy.ttomanito.domain.room.dto.request.SetUserMessageRequest;
import com.ssafy.ttomanito.domain.room.dto.response.ParticipantResponse;
import com.ssafy.ttomanito.domain.room.dto.response.RoomInfoResponse;
import com.ssafy.ttomanito.domain.room.service.RoomService;
import com.ssafy.ttomanito.domain.room.service.RoomUserService;
import com.ssafy.ttomanito.security.KakaoService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/room")
@RequiredArgsConstructor
public class RoomController {

    private final RoomService roomService;
    private final RoomUserService roomUserService;
    private final KakaoService kakaoService;  // JWT 서비스 (토큰 검증 및 사용자 ID 추출)

    // 1. 방 생성
    @PostMapping
    public RoomInfoResponse create(@RequestBody CreateRoomRequest req,
                                   @RequestHeader("Authorization") String accessToken) {
        // 카카오 Access Token을 통해 사용자 정보 조회
        String userInfo = kakaoService.getKakaoUserInfo(accessToken);  // Access Token을 사용하여 사용자 정보 얻기

        // 사용자 정보를 파싱하여 userId 추출 (예: JSON 파싱 후 ID 추출)
        Long userId = kakaoService.parseUserIdFromKakaoResponse(userInfo); // 예시로 사용자의 ID 추출
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
                               @RequestHeader("Authorization") String accessToken,
                               @RequestBody SetUserMessageRequest request) {
        // 카카오 Access Token을 통해 사용자 정보 조회
        String userInfo = kakaoService.getKakaoUserInfo(accessToken);  // Access Token을 사용하여 사용자 정보 얻기

        // 사용자 정보를 파싱하여 userId 추출 (예: JSON 파싱 후 ID 추출)
        Long userId = kakaoService.parseUserIdFromKakaoResponse(userInfo); // 예시로 사용자의 ID 추출
        roomUserService.enterWithMessage(roomId, userId, request.message());
    }

    // 5. 초대링크 진입 후 “참가하기” 버튼 눌렀을 때 호출
    @PostMapping("/{roomId}/enter")
    public void prepareEnter(@PathVariable Long roomId,
                             @RequestHeader("Authorization") String accessToken) {
        // 카카오 Access Token을 통해 사용자 정보 조회
        String userInfo = kakaoService.getKakaoUserInfo(accessToken);  // Access Token을 사용하여 사용자 정보 얻기

        // 사용자 정보를 파싱하여 userId 추출 (예: JSON 파싱 후 ID 추출)
        Long userId = kakaoService.parseUserIdFromKakaoResponse(userInfo); // 예시로 사용자의 ID 추출

        // 이미 방에 참여한 사용자인지 체크
        boolean isUserAlreadyInRoom = roomUserService.isUserInRoom(roomId, userId);

        if (isUserAlreadyInRoom) {
            // 이미 방에 존재하는 사용자라면 아무 동작도 하지 않거나,
            // 별도의 메시지를 반환할 수 있습니다.
            log.info("User {} is already in room {}", userId, roomId);
            return; // 혹은 예외를 던질 수 있음
        }

        // 방에 참여할 준비를 수행
        roomUserService.prepareEnter(roomId, userId);
    }

}
