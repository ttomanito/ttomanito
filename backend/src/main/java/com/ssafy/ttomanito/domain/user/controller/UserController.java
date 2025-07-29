package com.ssafy.ttomanito.domain.user.controller;

import com.ssafy.ttomanito.domain.user.dto.*;
import com.ssafy.ttomanito.domain.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/user")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;

    @PostMapping("/register")
    public ResponseEntity<UserDto> register(@RequestParam String name) {
        return ResponseEntity.ok(userService.register(name));
    }

    @PostMapping("/update")
    public ResponseEntity<UserDto> update(@RequestBody UserUpdateRequest dto) {
        return ResponseEntity.ok(userService.update(dto));
    }

    @GetMapping("/mypage{userId}")
    public ResponseEntity<UserDto> profile(@PathVariable Long userId) {
        return ResponseEntity.ok(userService.getMyPage(userId));
    }

    @PostMapping("/delete")
    public ResponseEntity<Void> delete(@RequestParam Long userId) {
        userService.delete(userId);
        return ResponseEntity.noContent().build();
    }
}
