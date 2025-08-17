package com.ssafy.ttomanito.domain.chatting.analysis.controller;

import com.ssafy.ttomanito.domain.chatting.analysis.dto.ChatAnalysisBrief;
import com.ssafy.ttomanito.domain.chatting.analysis.service.ChatAnalysisService;
import com.ssafy.ttomanito.global.security.userdetails.JwtUserDetails;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/chat")
@Tag(name = "채팅-AI분석", description = "채팅 상대 성향 분석 API")
public class ChatAnalysisController {

    private final ChatAnalysisService chatAnalysisService;

    @Operation(
            summary = "채팅 상대 성향 분석(요청자별 1회)",
            description = "같은 채팅방이라도 요청자에 따라 각 1회(마니또 1회, 마니띠 1회) 분석/캐시."
    )
    @GetMapping("/{chatroomId}/analysis/partner")
    public ResponseEntity<ChatAnalysisBrief> analyzePartner(
            @PathVariable Long chatroomId,
            @AuthenticationPrincipal JwtUserDetails user,
            @RequestParam(defaultValue = "200") int limit
    ) {
        return ResponseEntity.ok(
                chatAnalysisService.analyzePartner(chatroomId, user.getUserId(), Math.min(limit, 400))
        );
    }
}
