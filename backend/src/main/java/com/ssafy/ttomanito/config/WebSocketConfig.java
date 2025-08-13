package com.ssafy.ttomanito.config;

import com.ssafy.ttomanito.global.security.filter.JwtHandshakeInterceptor;
import com.ssafy.ttomanito.global.security.filter.WebSocketAuthChannelInterceptor;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

/**
 * WebSocket/STOMP 설정
 * - 채팅용 토픽: /topic/chat.*
 * - 대기방용 토픽: /topic/wating.*
 * - 유저 대상 큐:   /user/queue/**
 */
@Configuration
@EnableWebSocketMessageBroker
@Slf4j
@RequiredArgsConstructor
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    private final JwtHandshakeInterceptor jwtHandshakeInterceptor;
    private final WebSocketAuthChannelInterceptor wsAuthChannelInterceptor;

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        config.enableSimpleBroker("/queue", "/topic/chat", "/topic/waiting");
        config.setApplicationDestinationPrefixes("/app");
        config.setUserDestinationPrefix("/user");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws/chat")
                .addInterceptors(jwtHandshakeInterceptor)
                .setAllowedOriginPatterns(
                        "http://localhost:5173",
                        "http://localhost:8080",
                        "https://i13b206.p.ssafy.io"
                )
                .withSockJS()
                .setSessionCookieNeeded(true);
        registry.addEndpoint("/ws/waiting")
                .addInterceptors(jwtHandshakeInterceptor)
                .setAllowedOriginPatterns(
                        "http://localhost:5173",
                        "http://localhost:8080",
                        "https://i13b206.p.ssafy.io"
                )
                .withSockJS()
                .setSessionCookieNeeded(true);
        registry.addEndpoint("/ws")
                .addInterceptors(jwtHandshakeInterceptor)
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
        registration.interceptors(wsAuthChannelInterceptor);
    }
}
