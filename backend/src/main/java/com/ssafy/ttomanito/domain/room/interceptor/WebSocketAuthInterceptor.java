package com.ssafy.ttomanito.domain.room.interceptor;

import com.ssafy.ttomanito.domain.room.service.RoomPresenceService;
import com.ssafy.ttomanito.domain.room.util.DestinationUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.stereotype.Component;

import java.security.Principal;

@Component
@RequiredArgsConstructor
public class WebSocketAuthInterceptor implements ChannelInterceptor {

    private final RoomPresenceService presenceService;

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor acc = StompHeaderAccessor.wrap(message);

        if (StompCommand.CONNECT.equals(acc.getCommand())) {
            String token = acc.getFirstNativeHeader("Authorization"); // "Bearer 2001"
            Long userId = parseJwtAndGetUserId(token);
            acc.setUser(new StompPrincipal(userId));
        }

        if (StompCommand.SUBSCRIBE.equals(acc.getCommand())) {
            Long roomId = DestinationUtils.extractRoomIdAsLong(acc.getDestination());
            Long userId = currentUserId(acc.getUser());
            presenceService.joinBySubscribe(acc.getSessionId(), roomId, userId);
        }

        return message;
    }

    private Long currentUserId(Principal principal) {
        if (principal == null) throw new IllegalStateException("Unauthenticated WS user");
        return Long.valueOf(principal.getName());
    }

    private Long parseJwtAndGetUserId(String token) {
        if (token == null || token.isBlank()) throw new IllegalStateException("Missing Authorization header");
        return Long.valueOf(token.replace("Bearer", "").trim());
    }
}
