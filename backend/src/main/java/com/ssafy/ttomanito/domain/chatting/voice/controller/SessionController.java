package com.ssafy.ttomanito.domain.chatting.voice.controller;

import com.ssafy.ttomanito.domain.chatting.voice.dto.TokenRequest;
import com.ssafy.ttomanito.domain.chatting.voice.service.OpenViduService;
import io.openvidu.java.client.OpenViduHttpException;
import io.openvidu.java.client.OpenViduJavaClientException;
import io.openvidu.java.client.Session;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.Map;

@Slf4j
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
    @PostMapping(
            value = "/token",
            consumes = MediaType.APPLICATION_JSON_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE
    )
    public ResponseEntity<Map<String, String>> generateToken(@Valid @RequestBody TokenRequest req) {
        // record 접근 → req.sessionId(), req.nickname()
        log.info("[/openvidu/token] IN sessionId={}, nickname={}", req.sessionId(), req.nickname());

        // 간단 sessionId 형식 검증
        if (!req.sessionId().matches("^[a-zA-Z0-9_-]+$")) {
            return ResponseEntity.badRequest()
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(Map.of("error", "BadRequest", "message", "Invalid sessionId format"));
        }

        try {
            log.debug("[/openvidu/token] Requesting session from OpenVidu server...");
            Session session = openViduService.getOrCreateSession(req.sessionId());


            String token = openViduService.generateConnectionToken(session, req.nickname());
System.out.println("                "+token);
            return ResponseEntity.ok(Map.of("token", token));

        } catch (IllegalArgumentException e) {
            log.warn("[/openvidu/token] BAD REQUEST: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(Map.of("error", "BadRequest", "message", e.getMessage()));

        } catch (OpenViduHttpException e) {
            // OpenVidu 서버에서 발생한 HTTP 예외 - 상태 코드 그대로 전달
            log.warn("[/openvidu/token] OV HTTP EX status={} msg={}", e.getStatus(), e.getMessage());
            return ResponseEntity.status(e.getStatus())
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(Map.of(
                            "error", "OpenViduHttpException",
                            "status", String.valueOf(e.getStatus()),
                            "message", e.getMessage()
                    ));

        } catch (OpenViduJavaClientException e) {
            log.warn("[/openvidu/token] OV JAVA EX msg={}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(Map.of(
                            "error", "OpenViduJavaClientException",
                            "message", e.getMessage()
                    ));

        } catch (Exception e) {
            log.error("[/openvidu/token] OTHER EX", e);
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(Map.of(
                            "error", "ServiceUnavailable",
                            "message", "Cannot connect to OpenVidu Server"
                    ));
        }
    }
}
