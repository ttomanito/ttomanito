package com.ssafy.ttomanito.domain.rank.service;

import com.ssafy.ttomanito.domain.manito.repository.ManitoActivityRepository;
import com.ssafy.ttomanito.domain.mission.repository.DailyMissionRepository;
import com.ssafy.ttomanito.domain.rank.dto.RankingDto;
import com.ssafy.ttomanito.domain.rank.entity.RankingGenre;
import com.ssafy.ttomanito.domain.room.entity.RoomStatus;
import com.ssafy.ttomanito.domain.room.entity.RoomUser;
import com.ssafy.ttomanito.domain.room.repository.RoomUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

@Service
@RequiredArgsConstructor
public class RankingService {
    private final RoomUserRepository roomUserRepo;
    private final ManitoActivityRepository activityRepo;
    private final DailyMissionRepository dailyMissionRepo;
    // …

    @Transactional(readOnly = true)
    public List<RankingDto> getRoomRanking(int genreCode, Long userId) {
        RankingGenre genre = RankingGenre.fromCode(genreCode);

        // 1) 내 활성 방
        RoomUser me = roomUserRepo
                .findByUserUserIdAndRoomStatus(userId, RoomStatus.IN_PROGRESS)
                .orElseThrow();
        Long roomId = me.getRoom().getRoomId();

        // 2) 방 참여자 전체
        List<RoomUser> participants =
                roomUserRepo.findByRoom_RoomIdAndRoom_Status(roomId, RoomStatus.IN_PROGRESS);

        // 3) 장르별로 metricValue 계산
        List<Map.Entry<Long, Long>> stats = participants.stream()
                .map(ru -> {
                    Long uid = ru.getUser().getUserId();
                    long metric;
                    switch (genre) {
                        case MISSION_COUNT:
                            // (기존) 미션 개수
                            metric = activityRepo
                                    .sumMissionSuccessCountByRoomAndUser(roomId, uid);
                            break;
                        case VOICE_CALL:
                            // 새로 추가: sumCallTimeByRoomAndUser 쿼리 호출
                            metric = activityRepo
                                    .sumCallTimeByRoomAndUser(roomId, uid);
                            break;
                        case CHAT_COUNT:
                            metric = activityRepo
                                    .sumChatCountByRoomAndUser(roomId, uid);
                            break;
                        default:
                            metric = 0L;
                    }
                    return Map.entry(uid, metric);
                })
                .sorted(Map.Entry.comparingByValue(Comparator.reverseOrder()))
                .toList();

        // 4) DTO 로 변환
        return IntStream.range(0, stats.size())
                .mapToObj(i -> {
                    var e = stats.get(i);
                    return new RankingDto(e.getKey(), e.getValue(), i + 1);
                })
                .collect(Collectors.toList());
    }
}
