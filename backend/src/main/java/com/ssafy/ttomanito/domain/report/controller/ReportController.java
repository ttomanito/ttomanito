package com.ssafy.ttomanito.domain.report.controller;

import com.ssafy.ttomanito.domain.report.dto.ReportDetailResponseDto;
import com.ssafy.ttomanito.domain.report.service.ReportService;
import com.ssafy.ttomanito.global.security.userdetails.JwtUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/report")
@RequiredArgsConstructor
public class ReportController {
    private final ReportService reportService;

    @GetMapping("/history")
    public ResponseEntity<List<ReportDetailResponseDto>> getMyReportHistory(
            @AuthenticationPrincipal JwtUserDetails user
    ) {
        return ResponseEntity.ok(
                reportService.getFinishedReportHistory(user.getUserId())
        );
    }
}
