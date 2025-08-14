package com.ssafy.ttomanito.global.scheduler;


import com.ssafy.ttomanito.domain.room.entity.Room;
import com.ssafy.ttomanito.domain.room.entity.RoomStatus;
import com.ssafy.ttomanito.domain.room.repository.RoomRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class RoomScheduler {

    private final RoomRepository roomRepository;

    @Scheduled(cron = "10 0 0 * * *", zone = "Asia/Seoul") // 매일 00:00:10 KST
    @Transactional
    public void finishExpiredRooms() {
        ZoneId KST = ZoneId.of("Asia/Seoul");

        // 스케줄 실행 시각의 'KST 오늘'과 'KST 어제'를 명시적으로 계산
        LocalDate todayKst     = LocalDate.now(KST);
        LocalDate yesterdayKst = todayKst.minusDays(1);

        // 종료일이 '어제' 이하이고 아직 FINISHED가 아닌 방을 종료 대상으로 조회
        // (하루 놓친 경우도 함께 처리하려면 <= 어제, 정확히 어제만 처리하려면 equal로 변경)
        List<Room> targets = roomRepository
                .findAllByEndDateLessThanEqualAndStatusNot(yesterdayKst, RoomStatus.FINISHED);

        for (Room room : targets) {
            // 종료 메타데이터를 '종료일(=어제)'로 기록하고 상태 전환
            room.finish(yesterdayKst);
            log.info("✅ Room 종료: id={}, endDate={}, finishedAt={}",
                    room.getRoomId(), room.getEndDate(), yesterdayKst);
        }
    }
}
