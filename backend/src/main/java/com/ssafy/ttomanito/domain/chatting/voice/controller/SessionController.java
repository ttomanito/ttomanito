package com.ssafy.ttomanito.domain.chatting.voice.controller;


import com.ssafy.ttomanito.domain.chatting.voice.service.OpenViduService;
import io.openvidu.java.client.OpenViduHttpException;
import io.openvidu.java.client.OpenViduJavaClientException;
import io.openvidu.java.client.Session;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/openvidu")
public class SessionController {

    private final OpenViduService openViduService;

    public SessionController(OpenViduService openViduService) {
        this.openViduService = openViduService;
    }


    @Operation(
            summary = "OpenVidu 연결 토큰 발급",
            description = "주어진 세션 ID로 OpenVidu 세션을 생성 또는 조회하고, 해당 세션에 연결할 커넥션 토큰을 발급합니다."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "토큰 발급 성공",
                    content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE,
                            schema = @Schema(implementation = String.class))),
            @ApiResponse(responseCode = "401", description = "OpenVidu 서버 인증 실패"),
            @ApiResponse(responseCode = "502", description = "OpenVidu 클라이언트 예외 발생"),
            @ApiResponse(responseCode = "503", description = "OpenVidu 서버 연결 실패")
    })
    @PostMapping("/token")
    public ResponseEntity<String> generateToken(@RequestBody TokenRequest req) {
        try {
            // 1) 세션 생성 또는 조회
            Session session = openViduService.getOrCreateSession(req.sessionId());
            // 2) 커넥션 토큰 발급
            String token = openViduService.generateConnectionToken(session, req.nickname());
            return ResponseEntity.ok(token);
        } catch (OpenViduHttpException e) {
            // OpenVidu 서버가 반환한 HTTP 상태 코드와 메시지 그대로 전달
            return ResponseEntity
                    .status(e.getStatus())
                    .body("OpenVidu error: " + e.getMessage());
        } catch (OpenViduJavaClientException e) {
            // Java client 예외
            return ResponseEntity
                    .status(HttpStatus.BAD_GATEWAY)
                    .body("OpenVidu client error: " + e.getMessage());
        } catch (Exception e) {
            // 네트워크 오류 등 기타 예외
            return ResponseEntity
                    .status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body("Cannot connect to OpenVidu Server");
        }
    }

    // 요청 바디용 DTO
    public static record TokenRequest(
            String sessionId,
            String nickname
    ) {}
}
