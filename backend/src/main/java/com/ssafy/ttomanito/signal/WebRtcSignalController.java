package com.ssafy.ttomanito.signal;

import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
public class WebRtcSignalController {

    private final SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/signal/{roomId}")
    public void relaySignal(@DestinationVariable String roomId, SignalMessage signal) {
        System.out.println("📡 시그널 수신: " + signal.type() + " from " + signal.senderId());

        // 1:1 Unicast → Broadcast 로 변경
        messagingTemplate.convertAndSend(
                "/topic/signal/" + roomId,
                signal
        );
    }
}
