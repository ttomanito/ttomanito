package com.ssafy.ttomanito.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {

         /* ① 서버 → 클라이언트 경로
           - /topic  : 브로드캐스트(대기방, 알림 등)
           - /queue  : 1:1 프라이빗(STOMP에서 /user/queue/** 로 매핑) */
        config.enableSimpleBroker("/topic");


        /* ② 클라이언트 → 서버 경로
           - /app    : 기존 대기방·채팅
           - /signal : WebRTC 시그널링 (OFFER / ANSWER / ICE) */
        config.setApplicationDestinationPrefixes("/app");

          /* ③ 1:1 전송용 프리픽스
           convertAndSendToUser(target, "/queue/signal", ...) → /user/{session}/queue/signal */
        config.setUserDestinationPrefix("/user");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws/waiting")
                .setAllowedOriginPatterns("*")
                .withSockJS();

        /* WebRTC 시그널링 */
        registry.addEndpoint("/ws/signal")              // 프런트: new SockJS('/ws/signal')
                .setAllowedOriginPatterns("*")
                .withSockJS();
    }

}
