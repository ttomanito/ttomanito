package com.ssafy.ttomanito.domain.auth.controller;

import com.ssafy.ttomanito.domain.auth.dto.AccessTokenResponse;
import com.ssafy.ttomanito.domain.auth.service.AuthService;
import com.ssafy.ttomanito.domain.user.dto.UserDto;
import com.ssafy.ttomanito.domain.user.service.UserService;
import com.ssafy.ttomanito.global.security.userdetails.JwtUserDetails;
import com.ssafy.ttomanito.global.security.utils.CookieUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.util.WebUtils;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.stream.Stream;

@RequiredArgsConstructor
@RestController
@RequestMapping("/auth")
@Tag(name = "인증", description = "인증 API")
public class AuthController {

    private final AuthService authService;
    private final UserService userService;

    @Value("${spring.security.oauth2.client.registration.kakao.client-id}")
    private String kakaoClientId;

    @Value("${kakao.logout.redirect-uri}")
    private String kakaoLogoutRedirectUri;

    @Value("${url.redirect.base}")
    private String frontendRedirectBase;

    @Operation(
            summary = "현재 유저 조회",
            description = "JWT로 인증된 현재 로그인 사용자의 프로필을 반환합니다."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "조회 성공",
                    content = @Content(schema = @Schema(implementation = UserDto.class))),
            @ApiResponse(responseCode = "401", description = "인증되지 않음")
    })
    @GetMapping("/me")
    public ResponseEntity<UserDto> me(@AuthenticationPrincipal JwtUserDetails user) {
        if (user == null) return ResponseEntity.status(401).build();
        UserDto dto = userService.getMyPage(user.getUserId());
        return ResponseEntity.ok(dto);
    }

    @Operation(
            summary = "액세스 토큰 재발급",
            description = "refreshToken 쿠키를 이용해 새로운 accessToken을 발급합니다."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "재발급 성공",
                    content = @Content(schema = @Schema(implementation = AccessTokenResponse.class))),
            @ApiResponse(responseCode = "401", description = "리프레시 토큰 누락/무효")
    })
    @PostMapping("/refresh")
    public ResponseEntity<AccessTokenResponse> refreshAccessToken(HttpServletRequest request) {
        Cookie cookie = WebUtils.getCookie(request, "refreshToken");
        String refreshToken = cookie != null ? cookie.getValue() : null;
        AccessTokenResponse dto = authService.refreshAccessToken(refreshToken);
        return ResponseEntity.ok(dto);
    }

    /** 카카오 로그아웃 안내 페이지(두 버튼)로 이동 */
    @Operation(
            summary = "카카오 로그아웃 페이지로 이동",
            description = "카카오가 제공하는 로그아웃 안내 페이지(이 서비스만/카카오계정과 함께)를 표시합니다."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "302", description = "카카오 로그아웃 페이지로 리다이렉트")
    })
    @GetMapping("/kakao/logout-page")
    public void moveToKakaoLogoutPage(HttpServletResponse res) throws IOException {
        String url = "https://kauth.kakao.com/oauth/logout"
                + "?client_id=" + kakaoClientId
                + "&logout_redirect_uri=" + URLEncoder.encode(kakaoLogoutRedirectUri, StandardCharsets.UTF_8);
        res.sendRedirect(url);
    }

    /** 카카오가 되돌려 보내는 콜백: 여기서 우리 쿠키들 정리 후 프론트 /login 으로 이동 */
    @Operation(
            summary = "카카오 로그아웃 콜백",
            description = "카카오 로그아웃 후 호출되는 콜백입니다. 서비스 쿠키를 제거하고 프론트 로그인 화면으로 이동합니다."
    )
    @ApiResponse(responseCode = "302", description = "프론트 /login 으로 리다이렉트")
    @GetMapping("/kakao/logout/callback")
    public void kakaoLogoutCallback(HttpServletRequest req, HttpServletResponse res) throws IOException {
        java.util.stream.Stream.of("kakaoAccessToken","accessToken","refreshToken","JSESSIONID")
                .forEach(name -> CookieUtils.deleteCookie(req, res, name));
        res.sendRedirect(frontendRedirectBase + "/login");
    }
}