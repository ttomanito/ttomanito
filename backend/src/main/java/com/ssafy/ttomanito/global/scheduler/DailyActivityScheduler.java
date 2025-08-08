package com.ssafy.ttomanito.global.scheduler;

import com.ssafy.ttomanito.domain.chatting.message.repository.ChatMessageRepository;
import com.ssafy.ttomanito.domain.chatting.voice.repository.VoiceChatRepository;
import com.ssafy.ttomanito.domain.manito.entity.ManitoActivity;
import com.ssafy.ttomanito.domain.manito.repository.ManitoActivityRepository;
import com.ssafy.ttomanito.domain.poke.repository.PokeLogRepository;
import com.ssafy.ttomanito.domain.room.entity.RoomStatus;
import com.ssafy.ttomanito.domain.room.entity.RoomUser;
import com.ssafy.ttomanito.domain.room.repository.RoomUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class DailyActivityScheduler {

    private final RoomUserRepository roomUserRepo;
    private final PokeLogRepository pokeLogRepo;
    private final ChatMessageRepository chatMessageRepo;
    private final VoiceChatRepository voiceChatRepo;
    private final ManitoActivityRepository manitoActivityRepo;

    /**
     * 매일 00:00:00에 실행 — 전 날(어제) 데이터를 집계해서 manito_activity에 저장
     */
//    @Scheduled(cron = "0 0 0 * * *")
    // 2025년 8월 7일 오후 10시 27분(Asia/Seoul)에 실행
    // 2025년 8월 7일 22:42(Asia/Seoul) 실행
    @Scheduled(cron = "1 0 0 * * *") // 매일 자정

    @Transactional
    public void aggregateYesterdayActivities() {
        //어제 날짜 범위 계산
        ZoneId zone = ZoneId.of("Asia/Seoul");
        LocalDate yesterday = LocalDate.now(zone).minusDays(1);
        LocalDateTime start = yesterday.atStartOfDay();
        LocalDateTime end = start.plusDays(1);
        // 1) 어제 진행 중이었던 모든 RoomUser 조회 (진행 중인 방, 종료된 방)
        List<RoomUser> participants = roomUserRepo.findByRoom_StatusIn(
                List.of(RoomStatus.IN_PROGRESS, RoomStatus.FINISHED)
        );

        for (RoomUser ru : participants) {
            Long roomId = ru.getRoom().getRoomId();
            Long userId = ru.getUser().getUserId();
            Long ruId = ru.getRoomUserId();  // PK

            // ① 찌르기 합계 (어제)
            long pokeCount = pokeLogRepo
                    .sumPokeCountByRoomUserAndDate(ruId, yesterday);

            // ② 채팅 합계 (어제)
            long chatCount = chatMessageRepo
                    .countBySenderRoomUserIdAndSentAtBetween(ruId, start, end);

            // ③ 통화 시간 합계 (어제)
            long callTime = voiceChatRepo
                    .sumDurationSecByRoomUserAndDate(ruId, yesterday);

            // ④ 미션 성공 횟수 합계 (어제, ManitoActivity에 아직 없으므로 원시 로그에서 집계하거나)
            long missionSuccessCount = manitoActivityRepo
                    .sumMissionSuccessCountByRoomAndUser(roomId, userId);

            // ⑤ 엔티티 저장/수정
            Optional<ManitoActivity> opt = manitoActivityRepo.findByRoomUser(ru);
            if (opt.isPresent()) {
                ManitoActivity activity = opt.get();
                activity.updateCounts((int) pokeCount,
                        (int) chatCount,
                        (int) callTime,
                        (int) missionSuccessCount);
            } else {
                ManitoActivity newAct = ManitoActivity.builder()
                        .roomUser(ru)
                        .pokeCount((int) pokeCount)
                        .chatCount((int) chatCount)
                        .callTime((int) callTime)
                        .missionSuccessCount((int) missionSuccessCount)
                        .build();
                manitoActivityRepo.save(newAct);
            }
        }
    }
}
