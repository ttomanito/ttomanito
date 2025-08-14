package com.ssafy.ttomanito.global.scheduler;

import com.ssafy.ttomanito.domain.notice.entity.Notice;
import com.ssafy.ttomanito.domain.notice.entity.NoticeType;
import com.ssafy.ttomanito.domain.notice.repository.NoticeRepository;
import com.ssafy.ttomanito.domain.room.entity.RoomUser;
import com.ssafy.ttomanito.domain.room.repository.RoomUserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class MissionNoticeScheduler {

    private final RoomUserRepository roomUserRepository;
    private final NoticeRepository noticeRepository;

    /**
     * 매일 오전 9시에 실행
     */
    @Scheduled(cron = "0 0 9 * * *", zone = "Asia/Seoul")
    public void sendMissionNotices() {
        log.info("[미션 알림 스케줄러] 실행 시작");

        // 1. IN_PROGRESS 상태의 방에 참여 중인 사용자 조회
        List<RoomUser> roomUsers = roomUserRepository.findUsersInProgressRoom();

        // 2. 각 사용자에게 SYSTEM 알림 저장
        for (RoomUser ru : roomUsers) {
            Notice notice = Notice.of(ru.getUser(), NoticeType.MISSION);
            noticeRepository.save(notice);
        }

        log.info("[미션 알림 스케줄러] 완료 - 총 {}건 알림 저장됨", roomUsers.size());
    }
}
