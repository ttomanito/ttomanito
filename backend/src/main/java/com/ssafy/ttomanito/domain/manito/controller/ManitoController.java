package com.ssafy.ttomanito.domain.manito.controller;

import com.ssafy.ttomanito.domain.manito.dto.ManitoGuessRequestDto;
import com.ssafy.ttomanito.domain.manito.service.ManitoService;
import com.ssafy.ttomanito.global.security.userdetails.JwtUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RequiredArgsConstructor
@RestController
@RequestMapping("/manito")
public class ManitoController {
    private final ManitoService manitoService;
    @GetMapping("/manitee")
    public ResponseEntity<Long> getManiteeId(@AuthenticationPrincipal JwtUserDetails principal) {
        Long maniteeId = manitoService.getManiteeId(principal.getUserId());
        return ResponseEntity.ok(maniteeId);
    }
    @PostMapping("/guess")
    public ResponseEntity<Void> guessManito(
            @AuthenticationPrincipal JwtUserDetails principal,
            @RequestBody ManitoGuessRequestDto requestDto
    ) {
        manitoService.guessManito(principal.getUserId(), requestDto.guessedUserId());
        return ResponseEntity.ok().build();
    }
    
}
