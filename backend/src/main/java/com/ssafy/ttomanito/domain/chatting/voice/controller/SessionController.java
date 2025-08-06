package com.ssafy.ttomanito.domain.chatting.voice.controller;


import com.ssafy.ttomanito.domain.chatting.voice.service.OpenViduService;
import io.openvidu.java.client.OpenViduHttpException;
import io.openvidu.java.client.OpenViduJavaClientException;
import io.openvidu.java.client.Session;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/openvidu")
public class SessionController {

    private final OpenViduService openViduService;

    public SessionController(OpenViduService openViduService) {
        this.openViduService = openViduService;
    }

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
