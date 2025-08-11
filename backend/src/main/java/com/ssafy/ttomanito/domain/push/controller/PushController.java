package com.ssafy.ttomanito.domain.push.controller;

import com.ssafy.ttomanito.domain.push.service.PushTokenService;
import com.ssafy.ttomanito.global.security.userdetails.JwtUserDetails;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/push")
@RequiredArgsConstructor
@Tag(name = "푸쉬 알림", description = "푸쉬 알림 관련 API")
public class PushController {
    private final PushTokenService service;

    @PostMapping("/token")
    public void register(@AuthenticationPrincipal JwtUserDetails user,
                         @RequestBody Map<String, String> body) {
        service.saveToken(user.getUserId(), body.get("token"));
    }
}
