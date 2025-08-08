package com.ssafy.ttomanito.domain.chatting.service;

import com.ssafy.ttomanito.domain.chatting.message.repository.ChatMessageRepository;
import com.ssafy.ttomanito.domain.chatting.room.repository.ChattingRoomRepository;
import com.ssafy.ttomanito.domain.manito.entity.ManitoActivity;
import com.ssafy.ttomanito.domain.manito.repository.ManitoActivityRepository;
import com.ssafy.ttomanito.domain.manito.repository.ManitoAssignmentRepository;
import com.ssafy.ttomanito.domain.room.entity.RoomUser;
import com.ssafy.ttomanito.domain.room.repository.RoomUserRepository;
import com.ssafy.ttomanito.global.exception.NotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ChatStatisticsScheduler {

    private final ChatMessageRepository chatMessageRepository;
    private final ChattingRoomRepository chattingRoomRepository;
    private final ManitoAssignmentRepository manitoAssignmentRepository;
    private final ManitoActivityRepository manitoActivityRepository;
    private final RoomUserRepository roomUserRepository;

    @Scheduled(cron = "3 0 0 * * ?", zone = "Asia/Seoul")
    @Transactional
    public void updateDailyManitoChatCounts() {
        ZoneId zone = ZoneId.of("Asia/Seoul");
        LocalDateTime start = LocalDate.now(zone).minusDays(1).atStartOfDay();
        LocalDateTime end = LocalDate.now(zone).atStartOfDay();

        chatMessageRepository
                .countBySentAtBetweenGroupByRoomAndSender(start, end)
                .forEach(stat -> {
                    Long chatRoomId = stat.getChattingRoomId();
                    Long senderId = stat.getSenderRoomUserId();
                    int count = stat.getCount().intValue();

                    // (1) 이 채팅방의 ManitoAssignment 조회 → 마니또 roomUserId 비교
                    chattingRoomRepository.findById(chatRoomId)
                            .map(cr -> cr.getManitoAssignment().getManitoAssignmentId())
                            .flatMap(manitoAssignmentRepository::findById)
                            .filter(ma -> ma.getManito().getRoomUserId().equals(senderId))
                            .ifPresent(ma -> {
                                // (2) RoomUser 엔티티 로드
                                RoomUser ru = roomUserRepository.findById(senderId)
                                        .orElseThrow(() -> new NotFoundException("해당 채팅유저를 찾을 수 없습니다: " + senderId));

                                // (3) ManitoActivity 조회
                                manitoActivityRepository.findByRoomUser(ru)
                                        .ifPresent(activity -> {
                                            int prev = Optional.ofNullable(activity.getChatCount()).orElse(0);
                                            ManitoActivity updated = activity.toBuilder()
                                                    .chatCount(prev + count)
                                                    .build();
                                            manitoActivityRepository.save(updated);
                                        });
                            });
                });
    }
}
