package com.ssafy.ttomanito.domain.push.dto;

import io.swagger.v3.oas.annotations.media.Schema;

public record PushTokenRegisterRequest(
        @Schema(description = "FCM 또는 WebPush 토큰", example = "fcm-token-or-webpush-endpoint")
        String token
) {}