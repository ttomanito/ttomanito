package com.ssafy.ttomanito.domain.manito.service;

import com.ssafy.ttomanito.domain.chatting.message.repository.ChatMessageRepository;
import com.ssafy.ttomanito.domain.chatting.voice.repository.VoiceChatRepository;
import com.ssafy.ttomanito.domain.manito.entity.ManitoActivity;
import com.ssafy.ttomanito.domain.manito.repository.ManitoActivityRepository;
import com.ssafy.ttomanito.domain.poke.repository.PokeLogRepository;
import com.ssafy.ttomanito.domain.room.entity.RoomStatus;
import com.ssafy.ttomanito.domain.room.entity.RoomUser;
import com.ssafy.ttomanito.domain.room.repository.RoomUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ActivityAggregationService {

    private final RoomUserRepository roomUserRepo;
    private final PokeLogRepository pokeLogRepo;
    private final ChatMessageRepository chatMessageRepo;
    private final VoiceChatRepository voiceChatRepo;
    private final ManitoActivityRepository manitoActivityRepo;

    /**
     * 특정 날짜(day)의 활동을 전체(진행/종료) 참가자에 대해 집계
     * - 스케줄러가 day=yesterday로 호출
     * - 종료일이 'day'인 방은 스킵(종료 즉시 집계에서 반영했기 때문)
     */
    @Transactional
    public void aggregateForDate(LocalDate day) {
        LocalDateTime start = day.atStartOfDay();
        LocalDateTime end   = start.plusDays(1);

        List<RoomUser> participants = roomUserRepo.findByRoom_StatusIn(
                List.of(RoomStatus.IN_PROGRESS, RoomStatus.FINISHED)
        );

        participants.stream()
                .filter(ru -> {
                    // 종료된 방인데 종료일이 day와 같은 경우는 스킵 -> 중복 방지
                    return !(ru.getRoom().getStatus() == RoomStatus.FINISHED
                            && day.equals(ru.getRoom().getEndDate()));
                })
                .forEach(ru -> upsertOne(ru, day, start, end));
    }

    /**
     * 특정 날짜(day)의 활동을 특정 roomId 참가자들만 집계
     * - 수동 종료 시 즉시 호출
     */
    @Transactional
    public void aggregateForDateAndRoom(LocalDate day, Long roomId) {
        LocalDateTime start = day.atStartOfDay();
        LocalDateTime end   = start.plusDays(1);

        List<RoomUser> participants = roomUserRepo.findByRoom_RoomId(roomId);
        participants.forEach(ru -> upsertOne(ru, day, start, end));
    }

    private void upsertOne(RoomUser ru, LocalDate day, LocalDateTime start, LocalDateTime end) {
        Long ruId   = ru.getRoomUserId();
        Long roomId = ru.getRoom().getRoomId();
        Long userId = ru.getUser().getUserId();

        long pokeCount = pokeLogRepo.sumPokeCountByRoomUserAndDate(ruId, day);
        long chatCount = chatMessageRepo.countBySenderRoomUserIdAndSentAtBetween(ruId, start, end);
        long callTime  = voiceChatRepo.sumDurationSecByRoomUserAndDate(ruId, day);
        long missionSuccessCount = manitoActivityRepo.sumMissionSuccessCountByRoomAndUser(roomId, userId);

        Optional<ManitoActivity> opt = manitoActivityRepo.findByRoomUser(ru);
        if (opt.isPresent()) {
            // 구현체에 따라 누적 또는 설정 — 기존 스케줄러와 동일 동작
            opt.get().updateCounts((int) pokeCount, (int) chatCount, (int) callTime, (int) missionSuccessCount);
        } else {
            ManitoActivity act = ManitoActivity.builder()
                    .roomUser(ru)
                    .pokeCount((int) pokeCount)
                    .chatCount((int) chatCount)
                    .callTime((int) callTime)
                    .missionSuccessCount((int) missionSuccessCount)
                    .build();
            manitoActivityRepo.save(act);
        }
    }
}
