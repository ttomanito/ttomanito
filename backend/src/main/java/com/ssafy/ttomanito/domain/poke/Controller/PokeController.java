package com.ssafy.ttomanito.domain.poke.Controller;

import com.ssafy.ttomanito.domain.poke.service.PokeService;
import com.ssafy.ttomanito.global.security.userdetails.JwtUserDetails;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/poke")
@RequiredArgsConstructor
@Tag(name = "찌르기", description = "찌르기 관련 API")
public class PokeController {

    private final PokeService pokeService;

    @Operation(
            summary = "찌르기 실행",
            description = "로그인한 사용자가 상대방을 찌릅니다. " +
                    "내부적으로 poke_log에 기록되고, manito_activity의 poke_count가 증가합니다."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "찌르기 성공"),
            @ApiResponse(responseCode = "404", description = "참여 중인 방 또는 마니또 배정 정보가 없습니다")
    })
    @PostMapping
    public ResponseEntity<Void> poke(
            @AuthenticationPrincipal JwtUserDetails principal
    ) {
        pokeService.poke(principal.getUserId());
        return ResponseEntity.ok().build();
    }
}
