package com.ssafy.ttomanito.config;

import lombok.extern.slf4j.Slf4j;
import com.ssafy.ttomanito.global.security.jwt.JwtProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

import java.util.Objects;

/**
 * WebSocket/STOMP 설정
 * - 채팅용 토픽: /topic/chat.*
 * - 게임용 토픽: /topic/game.*
 * - 유저 대상 큐:   /user/queue/**
 */
@Configuration
@EnableWebSocketMessageBroker
@Slf4j
@RequiredArgsConstructor
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {
    private final JwtProvider jwtProvider;

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {

        // 브로커 활성화: 채팅, 게임, 개인 큐
        config.enableSimpleBroker("/topic/chat", "/topic/game", "/queue");
        // 클라이언트 -> 서버 메시지 prefix
        config.setApplicationDestinationPrefixes("/app");
        // 서버 -> 특정 사용자 메시지 prefix
        config.setUserDestinationPrefix("/user");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws/waiting")

                .setAllowedOriginPatterns(
                        "http://localhost:5173",
                        "http://localhost:8080",
                        "https://i13b206.p.ssafy.io"
                )
                .withSockJS()
                .setSessionCookieNeeded(true);
        registry.addEndpoint("/ws")

                .setAllowedOriginPatterns(
                        "http://localhost:5173",
                        "http://localhost:8080",
                        "https://i13b206.p.ssafy.io"
                )
                .withSockJS()
                .setSessionCookieNeeded(true);

    }


}

