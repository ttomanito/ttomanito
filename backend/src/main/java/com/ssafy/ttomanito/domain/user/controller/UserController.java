package com.ssafy.ttomanito.domain.user.controller;

import com.ssafy.ttomanito.domain.user.dto.UserDto;
import com.ssafy.ttomanito.domain.user.service.UserService;
import com.ssafy.ttomanito.global.security.userdetails.JwtUserDetails;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.stream.Stream;

@RestController
@RequestMapping("/user")
@RequiredArgsConstructor
@Tag(name = "유저", description = "유저 관리 API")
public class UserController {
    private final UserService userService;

    @Operation(summary = "회원가입", description = "이름을 입력받아 새로운 사용자를 등록합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "회원가입 성공"),
            @ApiResponse(responseCode = "400", description = "이름 파라미터 누락 또는 형식 오류")
    })
    @PostMapping("/register")
    public ResponseEntity<UserDto> register(
            @Parameter(description = "등록할 사용자 이름", required = true)
            @RequestParam("name") String name
    ) {
        UserDto created = userService.register(name);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @Operation(summary = "사용자 이름 수정", description = "로그인한 사용자의 이름을 수정합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "수정 성공"),
            @ApiResponse(responseCode = "400", description = "새 이름 파라미터 누락 또는 형식 오류"),
            @ApiResponse(responseCode = "404", description = "사용자를 찾을 수 없음")
    })
    @PostMapping("/update")
    public ResponseEntity<UserDto> update(
            @AuthenticationPrincipal JwtUserDetails user,
            @Parameter(description = "새 이름", required = true)
            @RequestParam("name") String name
    ) {
        UserDto updated = userService.update(user.getUserId(), name);
        return ResponseEntity.ok(updated);
    }

    @Operation(summary = "마이페이지 - 프로필 조회", description = "로그인한 사용자의 프로필 정보를 반환합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "조회 성공"),
            @ApiResponse(responseCode = "404", description = "사용자를 찾을 수 없음")
    })
    @GetMapping("/profile")
    public ResponseEntity<UserDto> profile(
            @AuthenticationPrincipal JwtUserDetails user
    ) {
        UserDto dto = userService.getMyPage(user.getUserId());
        return ResponseEntity.ok(dto);
    }

    @Operation(summary = "회원탈퇴", description = "로그인한 사용자의 계정을 탈퇴 처리합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "탈퇴 성공"),
            @ApiResponse(responseCode = "404", description = "사용자를 찾을 수 없음")
    })
    @PostMapping("/delete")
    public ResponseEntity<Void> delete(@AuthenticationPrincipal JwtUserDetails user,
                                       HttpServletResponse resp) {
        userService.delete(user.getUserId());
        Stream.of("accessToken", "refreshToken")
                .forEach(name -> {
                    Cookie c = new Cookie(name, null);
                    c.setPath("/");
                    c.setMaxAge(0);
                    resp.addCookie(c);
                });
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "사용자 이름 조회", description = "userId로 다른 사용자의 이름을 조회합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "조회 성공"),
            @ApiResponse(responseCode = "404", description = "사용자를 찾을 수 없음")
    })
    @GetMapping("/{userId}")
    public ResponseEntity<String> getUserName(
            @Parameter(description = "조회할 사용자 ID", required = true)
            @PathVariable Long userId
    ) {
        String name = userService.getUserName(userId);
        return ResponseEntity.ok(name);
    }
}
