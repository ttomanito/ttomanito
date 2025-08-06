//package com.ssafy.ttomanito.domain.report.controller;
//
//import com.ssafy.ttomanito.domain.report.dto.ReportComparisonDto;
//import com.ssafy.ttomanito.domain.report.service.ReportService;
//import lombok.RequiredArgsConstructor;
//import org.springframework.web.bind.annotation.GetMapping;
//import org.springframework.web.bind.annotation.PathVariable;
//import org.springframework.web.bind.annotation.RequestMapping;
//import org.springframework.web.bind.annotation.RestController;
//
//@RestController
//@RequiredArgsConstructor
//@RequestMapping("/report")
//public class ReportController {
//    private final ReportService reportSvc;
//
//    @GetMapping("/compare/{roomId}/{roomUserId}")
//    public ReportComparisonDto compare(
//            @PathVariable Long roomId,
//            @PathVariable Long roomUserId
//    ) {
//        return reportSvc.compareMyActivity(roomId, roomUserId);
//    }
//}
//
