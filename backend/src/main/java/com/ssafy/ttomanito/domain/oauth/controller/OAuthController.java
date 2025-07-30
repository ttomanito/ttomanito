package com.ssafy.ttomanito.domain.oauth.controller;

import com.ssafy.ttomanito.domain.user.dto.UserDto;
import com.ssafy.ttomanito.domain.user.service.UserService;
import com.ssafy.ttomanito.global.security.userdetails.JwtUserDetails;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/oauth2")
@RequiredArgsConstructor
public class OAuthController {
    private final UserService userService;

    @GetMapping("/callback/kakao")
    public String kakaoCallback(HttpServletRequest request,
                                @AuthenticationPrincipal JwtUserDetails principal,
                                Model model) {
        if (principal != null) {
            UserDto userDto = userService.getMyPage(principal.getUserId());
            model.addAttribute("user", userDto);
        }
        return "kakao-success";
    }
}

