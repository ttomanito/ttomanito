package com.ssafy.ttomanito.domain.chatting.analysis.service;

import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.openai.client.OpenAIClient;
import com.openai.models.ChatModel;
import com.openai.models.responses.Response;
import com.openai.models.responses.ResponseCreateParams;
import com.ssafy.ttomanito.domain.chatting.analysis.dto.ChatAnalysisBrief;
import com.ssafy.ttomanito.domain.chatting.analysis.entity.ChatAnalysisDoc;
import com.ssafy.ttomanito.domain.chatting.analysis.repository.ChatAnalysisRepository;
import com.ssafy.ttomanito.domain.chatting.message.entity.ChatMessage;
import com.ssafy.ttomanito.domain.chatting.message.repository.ChatMessageRepository;
import com.ssafy.ttomanito.domain.chatting.room.dto.Participants;
import com.ssafy.ttomanito.domain.chatting.service.ChattingService;
import com.ssafy.ttomanito.global.exception.NotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.Comparator;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ChatAnalysisService {

    private final ChatMessageRepository chatRepo;
    private final ChattingService chattingService;
    private final ChatAnalysisRepository analysisRepo;
    private final OpenAIClient openAI;

    private static final DateTimeFormatter TS = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss");
    private static final ObjectMapper MAPPER = new ObjectMapper()
            .configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);

    /** 방당 '요청자별 1회' 실행 (마니또 1회, 마니띠 1회) */
    public ChatAnalysisBrief analyzePartner(Long chatRoomId, Long currentUserId, int limit) {
        // 0) 캐시 확인
        var cached = analysisRepo.findByChatRoomIdAndRequestedBy(chatRoomId, currentUserId);
        if (cached.isPresent()) return cached.get().getResult();

        // 1) 참여자/상대 식별
        Participants ps = chattingService.participants(chatRoomId);
        Long partnerUserId = resolvePartnerUserId(ps, currentUserId);

        // 2) 최근 N개 메시지 로드 (오름차순 정렬)
        var pageable = PageRequest.of(0, limit, Sort.by(Sort.Direction.DESC, "sentAt"));
        List<ChatMessage> recentDesc =
                chatRepo.findByChattingRoomIdAndSentAtBefore(chatRoomId, LocalDateTime.now(ZoneId.of("Asia/Seoul")), pageable);
        List<ChatMessage> recent = recentDesc.stream()
                .sorted(Comparator.comparing(ChatMessage::getSentAt))
                .toList();
        if (recent.isEmpty()) throw new NotFoundException("분석할 채팅이 없습니다.");

        // 3) 경량 프롬프트 생성
        String prompt = buildBriefPrompt(recent, currentUserId, partnerUserId);

        // 4) OpenAI 호출 → JSON → DTO
        try {
            ResponseCreateParams params = ResponseCreateParams.builder()
                    .input(prompt)
                    .model(ChatModel.GPT_4_1_MINI)
                    .temperature(0.2)
                    .maxOutputTokens(600)
                    .build();

            Response response = openAI.responses().create(params);
            String json = extractOutputJson(response);   // ← 여기 수정됨
            if (json.isBlank()) throw new IllegalStateException("AI가 빈 응답을 반환했습니다.");

            ChatAnalysisBrief brief = MAPPER.readValue(json, ChatAnalysisBrief.class);

            // 5) 저장
            ChatAnalysisDoc doc = ChatAnalysisDoc.builder()
                    .chatRoomId(chatRoomId)
                    .requestedBy(currentUserId)
                    .partnerUserId(partnerUserId)
                    .result(brief)
                    .analyzedAt(LocalDateTime.now(ZoneId.of("Asia/Seoul")))
                    .build();
            analysisRepo.save(doc);

            return brief;

        } catch (Exception e) {
            log.warn("[ChatAnalysis] OpenAI 호출 실패: {}", e.getMessage(), e);
            throw new RuntimeException("AI 분석 호출에 실패했습니다. 잠시 후 다시 시도하세요.");
        }
    }

    private Long resolvePartnerUserId(Participants ps, Long currentUserId) {
        if (ps.manitoUserId().equals(currentUserId)) return ps.maniteeUserId();
        if (ps.maniteeUserId().equals(currentUserId)) return ps.manitoUserId();
        throw new NotFoundException("채팅방 참가자가 아닙니다.");
    }

    private String buildBriefPrompt(List<ChatMessage> msgs, Long meUserId, Long partnerUserId) {
        StringBuilder sb = new StringBuilder();
        sb.append("""
        시스템 규칙:
        - 아래 채팅 로그만 근거로 '상대방(PARTNER)'을 분석.
        - 반드시 다음 JSON 스키마 딱 하나만 반환(마크다운/설명 금지).
        - 스키마:
        {
          "summary": "핵심 한줄",
          "style": "톤/길이/반응성 한 줄",
          "topTips": ["구체적 행동 팁 3개"],
          "caution": "오해/주의 1개",
          "confidence": 0.0
        }
        작업:
        1) PARTNER의 말투/반응 템포를 한 줄로 요약(style)
        2) 실제로 도움이 되는 행동 팁 3개(topTips)
        3) 주의할 점 1개(caution)
        4) 데이터가 부족하면 confidence를 낮춰라
        """);

        sb.append("채팅 로그 (오래된 → 최신):\n");
        for (var m : msgs) {
            if (m.getType() == null || m.getContent() == null) continue;
            if (!"TEXT".equals(m.getType().name())) continue;

            String speaker = m.getSenderUserId().equals(partnerUserId) ? "PARTNER"
                    : (m.getSenderUserId().equals(meUserId) ? "YOU" : "OTHER");

            String ts = m.getSentAt() != null ? TS.format(m.getSentAt()) : "unknown";
            String line = m.getContent().replaceAll("\\s+", " ").trim();
            sb.append("[").append(ts).append("] ").append(speaker).append(": ").append(line).append("\n");
        }
        sb.append("\n위 스키마 JSON만 반환해.");
        return sb.toString();
    }

    /** OpenAI Response → JSON 문자열 추출 (SDK 버전 차이 안전 처리) */
    private static String extractOutputJson(Response r) {
        if (r == null || r.output() == null) return "";

        StringBuilder sb = new StringBuilder();

        r.output().forEach(out -> out.message().ifPresent(msg -> {
            if (msg.content() == null) return;

            msg.content().forEach(content -> {
                String s = findFirstString(content); // 유니온 content에서 최초 문자열만 뽑기
                if (s != null && !s.isBlank()) {
                    sb.append(s);
                }
            });
        }));

        return stripCodeFences(sb.toString()).trim();
    }

    /** 여러 레이어(Optional/Collection/유니온 객체)를 재귀로 풀어서 실제 문자열을 찾아 반환 */
    private static String findFirstString(Object obj) {
        if (obj == null) return null;

        // 1) 이미 문자열 계열이면 바로 반환
        if (obj instanceof CharSequence cs) return cs.toString();

        // 2) Optional이면 내부로
        if (obj instanceof java.util.Optional<?> opt) {
            return findFirstString(opt.orElse(null));
        }

        // 3) 컬렉션이면 첫 번째 유효 문자열을 찾는다
        if (obj instanceof java.util.Collection<?> col) {
            for (Object o : col) {
                String s = findFirstString(o);
                if (s != null) return s;
            }
            return null;
        }

        // 4) 메서드 이름 후보들을 순서대로 시도 (버전/타입별 대응)
        String[] methodCandidates = {
                "outputText", "text", "value", "getValue", "getText", "content", "getContent"
        };
        for (String m : methodCandidates) {
            try {
                var method = obj.getClass().getMethod(m);
                Object v = method.invoke(obj);
                String s = findFirstString(v);
                if (s != null) return s;
            } catch (NoSuchMethodException ignore) {
            } catch (Exception ignore) {}
        }

        // 5) 필드 접근까지 최후 수단으로 시도
        String[] fieldCandidates = {"value", "text", "content"};
        for (String f : fieldCandidates) {
            try {
                var field = obj.getClass().getDeclaredField(f);
                field.setAccessible(true);
                Object v = field.get(obj);
                String s = findFirstString(v);
                if (s != null) return s;
            } catch (NoSuchFieldException ignore) {
            } catch (Exception ignore) {}
        }

        // 문자열을 못 찾으면 null (toString()은 절대 사용하지 말 것: 'ResponseOutputText(...)'가 나와서 JSON 파싱 실패함)
        return null;
    }

    /** ```json … ``` 같은 코드펜스 제거 */
    private static String stripCodeFences(String s) {
        if (s == null) return null;
        s = s.trim();
        if (s.startsWith("```")) {
            int nl = s.indexOf('\n');
            if (nl >= 0) s = s.substring(nl + 1);
            if (s.endsWith("```")) s = s.substring(0, s.length() - 3);
        }
        return s.trim();
    }
}
