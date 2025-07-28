package com.ssafy.ttomanito.security;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpEntity;
import org.springframework.http.ResponseEntity;

@Service
public class KakaoService {

    private static final String KAKAO_USER_INFO_URL = "https://kapi.kakao.com/v2/user/me";  // 카카오 사용자 정보 API URL
    private static final ObjectMapper objectMapper = new ObjectMapper();  // Jackson의 ObjectMapper 사용

    // 카카오 Access Token을 통해 사용자 정보를 가져오는 메서드
    public String getKakaoUserInfo(String accessToken) {
        // 헤더에 Bearer 토큰 추가
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + accessToken);

        HttpEntity<String> entity = new HttpEntity<>(headers);

        // 카카오 사용자 정보 API 호출
        RestTemplate restTemplate = new RestTemplate();
        ResponseEntity<String> response = restTemplate.exchange(KAKAO_USER_INFO_URL, org.springframework.http.HttpMethod.GET, entity, String.class);

        return response.getBody();  // JSON 형식의 사용자 정보 응답 반환
    }

    // 카카오 응답에서 userId 추출
    public Long parseUserIdFromKakaoResponse(String userInfo) {
        try {
            // JSON을 파싱하여 JsonNode 객체로 변환
            JsonNode jsonNode = objectMapper.readTree(userInfo);

            // 카카오 API 응답에서 'id' 값을 추출
            return jsonNode.get("id").asLong();  // 'id' 필드가 사용자 ID
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Failed to parse Kakao user info");
        }
    }
}
