package com.ssafy.ttomanito.domain.report.dto;

public record ReportDetailResponseDto(
        Long roomId,
        ReceivingHelpDto receivingHelp,
        GivingHelpDto givingHelp
) {}
