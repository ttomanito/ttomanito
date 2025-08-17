package com.ssafy.ttomanito.global.scheduler;

import com.ssafy.ttomanito.domain.manito.service.ActivityAggregationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.ZoneId;

@Slf4j
@Component
@RequiredArgsConstructor
public class DailyActivityScheduler {

    private final ActivityAggregationService aggregator;

    @Scheduled(cron = "1 0 0 * * *", zone = "Asia/Seoul") // 매일 00:00:01 KST
    @Transactional
    public void aggregateYesterdayActivities() {
        LocalDate yesterday = LocalDate.now(ZoneId.of("Asia/Seoul")).minusDays(1);
        aggregator.aggregateForDate(yesterday);
        log.info("✅ 일일 집계 완료 (day={})", yesterday);
    }
}
