package com.ssafy.ttomanito.domain.chatting.analysis.entity;

import com.ssafy.ttomanito.domain.chatting.analysis.dto.ChatAnalysisBrief;
import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "chat_analysis")
@CompoundIndex(name = "room_requester_unique", def = "{'chatRoomId': 1, 'requestedBy': 1}", unique = true)
@Getter @Builder @NoArgsConstructor @AllArgsConstructor
public class ChatAnalysisDoc {
    @Id
    private String id;

    private Long chatRoomId;          // 방 ID
    private Long requestedBy;         // 분석을 요청한 사용자(마니또 or 마니띠)
    private Long partnerUserId;       // 요청자가 분석 대상으로 삼은 상대 사용자

    private ChatAnalysisBrief result; // 경량 분석 결과
    private LocalDateTime analyzedAt; // 분석 시각
}
