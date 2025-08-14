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
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class RoomScheduler {

    private final RoomRepository roomRepository;

    @Scheduled(cron = "0 0 0 * * *", zone = "Asia/Seoul") // 매일 자정
    @Transactional
    public void finishExpiredRooms() {
        LocalDate today = LocalDate.now();
        List<Room> expiredRooms = roomRepository.findAllByEndDateBeforeAndStatusNot(today, RoomStatus.FINISHED);

        for (Room room : expiredRooms) {
            room.finish(LocalDate.now()); // Room 엔티티에 도메인 메서드 추가
            log.info("✅ Room 종료: {}", room.getRoomId());
        }
    }
}
