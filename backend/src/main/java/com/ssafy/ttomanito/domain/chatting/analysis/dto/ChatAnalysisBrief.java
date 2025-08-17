package com.ssafy.ttomanito.domain.chatting.analysis.dto;

import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Schema;
import java.util.List;

@Schema(description = "채팅 상대 성향 - 경량 결과")
public record ChatAnalysisBrief(
        @Schema(description = "핵심 한줄 요약") String summary,
        @Schema(description = "커뮤니케이션 스타일(톤/길이/반응성 등 한 줄)") String style,
        @ArraySchema(arraySchema = @Schema(description = "상대에게 통하는 TOP 3 액션 팁")) List<String> topTips,
        @Schema(description = "주의 한가지(오해 포인트/선 넘지 말 것)") String caution,
        @Schema(minimum = "0.0", maximum = "1.0", description = "신뢰도") Double confidence
) {}
