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
    private final UserService svc;

//    @PostMapping("/login")
//    public ResponseEntity<UserDto> login(@RequestBody UserLoginRequestDto dto) {
//        return ResponseEntity.ok(svc.login(dto));
//    }

    @PostMapping("/register")
    public ResponseEntity<UserDto> register(@RequestBody UserRegisterRequestDto dto) {
        return ResponseEntity.ok(svc.register(dto));
    }

    @PostMapping("/update")
    public ResponseEntity<UserDto> update(@RequestBody UserUpdateRequestDto dto) {
        return ResponseEntity.ok(svc.update(dto));
    }

    @GetMapping("/profile/{userId}")
    public ResponseEntity<UserDto> profile(@PathVariable Long userId) {
        return ResponseEntity.ok(svc.getProfile(userId));
    }


    @PostMapping("/delete")
    public ResponseEntity<Void> delete(@RequestParam Long userId) {
        svc.delete(userId);
        return ResponseEntity.noContent().build();
    }
}
