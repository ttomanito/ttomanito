package com.ssafy.ttomanito.domain.rank.service;

import com.ssafy.ttomanito.domain.manito.repository.ManitoActivityRepository;
import com.ssafy.ttomanito.domain.rank.dto.RankingDto;
import com.ssafy.ttomanito.domain.rank.entity.RankingGenre;
import com.ssafy.ttomanito.domain.manito.entity.ManitoActivity;
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
    @Transactional(readOnly = true)
    public List<RankingDto> getRoomRanking(int genreCode, Long userId) {
        // 1) 장르 파싱
        RankingGenre genre = RankingGenre.fromCode(genreCode);

        // 2) 사용자 ACTIVE 방 조회
        RoomUser me = roomUserRepo
                .findByUser_UserIdAndRoom_Status(userId, RoomStatus.IN_PROGRESS)
                .orElseThrow(() -> new IllegalStateException("활성 방을 찾을 수 없습니다"));

        Long roomId = me.getRoom().getRoomId();

        // 3) 방의 모든 활동 가져오기
        List<ManitoActivity> activities = activityRepo.findByRoomId(roomId);

        // 4) userId ↔ metricValue 매핑 후 값 내림차순 정렬
        List<Map.Entry<Long, Long>> sortedEntries = activities.stream()
                .map(a -> {
                    Long metric = Long.valueOf(switch (genre) {
                        case VOICE_CALL    -> a.getCallTime();                   // 이미 Long 또는 long
                        case CHAT_COUNT    -> (long) a.getChatCount();           // int → long (자동박싱으로 Long)
                        case MISSION_COUNT -> a.getMissionSuccessCount(); // Integer → long
                    });
                    return Map.entry(a.getRoomUser().getUser().getUserId(), metric);
                })
                // 제네릭 명시 없이도 추론 가능
                .sorted(Map.Entry.comparingByValue(Comparator.reverseOrder()))
                .toList();
        // 5) 순위(index+1)와 함께 RankingDto 생성
        List<RankingDto> ranking = IntStream.range(0, sortedEntries.size())
                .mapToObj(i -> {
                    var entry = sortedEntries.get(i);
                    return new RankingDto(
                            entry.getKey(),        // userId
                            entry.getValue(),      // metricValue
                            i + 1                  // rankPosition
                    );
                })
                .collect(Collectors.toList());

        return ranking;
    }

}
