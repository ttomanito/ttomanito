package com.ssafy.ttomanito.domain.chatting.voice.controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ssafy.ttomanito.domain.chatting.voice.dto.TokenRequest;
import com.ssafy.ttomanito.domain.chatting.voice.dto.TokenResponse;
import com.ssafy.ttomanito.domain.chatting.voice.service.OpenViduService;
import io.openvidu.java.client.OpenViduHttpException;
import io.openvidu.java.client.OpenViduJavaClientException;
import io.openvidu.java.client.Session;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.Map;
import java.util.Optional;


@Slf4j
@RestController
@RequestMapping("/openvidu")
public class SessionController {

    private final OpenViduService openViduService;

    public SessionController(OpenViduService openViduService) {
        this.openViduService = openViduService;
    }
    private final ObjectMapper om = new ObjectMapper();

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
    public ResponseEntity<Map<String, String>> generateToken(@Valid @RequestBody TokenRequest req)
            throws OpenViduJavaClientException, OpenViduHttpException, URISyntaxException {

        log.info("[/openvidu/token] IN sessionId={}, nickname={}", req.sessionId(), req.nickname());

        // 1) 세션 생성 or 조회
        Session session = openViduService.getOrCreateSession(req.sessionId());

        // 2) 토큰 발급 (여기서 주소+토큰 형태 반환됨)
        String rawToken = openViduService.generateConnectionToken(session, req.nickname());

        URI u = new URI(rawToken); // wss://.../openvidu?sessionId=...&token=tok_...&...
        String query = u.getRawQuery();
        String tokOnly = null;
        for (String p : query.split("&")) {
            if (p.startsWith("token=")) {
                tokOnly = p.substring("token=".length());
                break;
            }
        }
        if (tokOnly == null) throw new IllegalStateException("OpenVidu token not found");

        return ResponseEntity.ok(Map.of(
                "token", tokOnly,                 // ★ tok_… 만
                "sessionId", session.getSessionId()
        ));
    }
}