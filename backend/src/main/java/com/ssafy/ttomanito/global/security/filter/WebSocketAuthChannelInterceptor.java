package com.ssafy.ttomanito.global.security.filter;

import com.ssafy.ttomanito.global.security.jwt.JwtProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.Map;

import static com.ssafy.ttomanito.global.security.filter.JwtHandshakeInterceptor.ATTR_JWT;

@Slf4j
@Component
@RequiredArgsConstructor
public class WebSocketAuthChannelInterceptor implements ChannelInterceptor {

    private final JwtProvider jwtProvider;

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor acc = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
        if (acc != null && StompCommand.CONNECT.equals(acc.getCommand())) {
            String token = resolveFromSession(acc.getSessionAttributes());
            if (token == null) token = resolveFromNativeHeader(acc);

            if (token != null && jwtProvider.isTokenValid(token)) {
                UserDetails ud = jwtProvider.loadUserFromToken(token);
                var auth = new UsernamePasswordAuthenticationToken(ud, null, ud.getAuthorities());
                acc.setUser(auth);
                log.debug("[WS] Authentication set for user={}", ud.getUsername());
            }
        }
        return message;
    }

    private String resolveFromSession(Map<String, Object> attrs) {
        if (attrs == null) return null;
        Object v = attrs.get(ATTR_JWT);
        return v instanceof String ? (String) v : null;
    }

    private String resolveFromNativeHeader(StompHeaderAccessor acc) {
        List<String> auth = acc.getNativeHeader(HttpHeaders.AUTHORIZATION);
        if (auth != null && !auth.isEmpty()) {
            String h = auth.get(0);
            if (StringUtils.hasText(h) && h.startsWith("Bearer ")) return h.substring(7);
        }
        return null;
    }
}

