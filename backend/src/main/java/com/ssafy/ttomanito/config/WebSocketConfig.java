package com.ssafy.ttomanito.config;

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
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns(
                        "http://localhost:5173",
                        "http://localhost:8080",
                        "https://i13b206.p.ssafy.io"
                )
                .withSockJS()
                .setSessionCookieNeeded(true);
    }

    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        registration.interceptors(new ChannelInterceptor() {
            @Override
            public Message<?> preSend(Message<?> message, MessageChannel channel) {
                StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
                if (StompCommand.CONNECT.equals(Objects.requireNonNull(accessor).getCommand())) {
                    String bearer = accessor.getFirstNativeHeader("Authorization");
                    if (bearer != null && bearer.startsWith("Bearer ")) {
                        String token = bearer.substring(7);
                        // 사용자 정보를 파싱해 UserDetails 획득
                        UserDetails userDetails = jwtProvider.loadUserFromToken(token);
                        // Authentication 객체 생성
                        var auth = new UsernamePasswordAuthenticationToken(
                                userDetails, null, userDetails.getAuthorities());
                        accessor.setUser(auth);
                    }
                }
                return message;
            }
        });
    }
}