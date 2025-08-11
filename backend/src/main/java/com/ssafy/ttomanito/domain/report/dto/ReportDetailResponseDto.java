package com.ssafy.ttomanito.domain.report.dto;

public record ReportDetailResponseDto(
        Long roomId,
        String roomName,
        ReceivingHelpDto receivingHelp,
        GivingHelpDto givingHelp
) {}
