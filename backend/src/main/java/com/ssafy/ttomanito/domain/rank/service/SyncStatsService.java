//package com.ssafy.ttomanito.domain.rank.service;
//
//import com.ssafy.ttomanito.domain.manito.repository.ManitoActivityRepository;
//import com.ssafy.ttomanito.domain.room.repository.RoomUserRepository;
//import lombok.RequiredArgsConstructor;
//import org.springframework.scheduling.annotation.Scheduled;
//import org.springframework.stereotype.Service;
//import org.springframework.transaction.annotation.Transactional;
//
//import java.util.List;
//
//// com.ssafy.ttomanito.domain.rank.service.SyncStatsService.java
//@Service
//@RequiredArgsConstructor
//public class SyncStatsService {
//
//    private final StatsClient statsClient;
//    private final ManitoActivityRepository activityRepo;
//    private final RoomUserRepository roomUserRepo;
//
//    /** 매시간 정각에 통계 동기화 */
//    @Transactional
//    @Scheduled(cron = "0 0 * * * *", zone = "Asia/Seoul")
//    public void syncAllRooms() {
//        // 1) 현재 ACTIVE 방 리스트 조회 (원하는 방만)
//        List<Long> activeRoomIds = roomUserRepo.findDistinctRoomIdsByStatus(RoomStatus.ACTIVE);
//
//        for (Long roomId : activeRoomIds) {
//            // 2) 외부 API 호출
//            List<ExternalStat> stats = statsClient.fetchRoomStats(roomId);
//            if (stats == null) continue;
//
//            // 3) 각 통계별로 ManitoActivity 갱신
//            for (ExternalStat s : stats) {
//                activityRepo.findByRoomUser_Room_RoomIdAndRoomUser_RoomUserId(roomId, s.roomUserId())
//                        .ifPresentOrElse( activity -> {
//                                    activity.updateCallTime(s.totalCallTime());
//                                    activity.updateChatCount(s.totalChatCount());
//                                    activity.updatePokeCount(s.totalPokeCount());
//                                    activity.updateMissionCount(s.totalMissionCount());
//                                }, () -> {
//                                    // 없으면 신규 생성
//                                    ManitoActivity newAct = ManitoActivity.builder()
//                                            .roomUser(roomUserRepo.getReferenceById(s.roomUserId()))
//                                            .callTime(s.totalCallTime())
//                                            .chatCount(s.totalChatCount())
//                                            .missionSuccessCount(s.totalMissionCount())
//                                            .pokeCount(s.totalPokeCount())
//                                            .build();
//                                    activityRepo.save(newAct);
//                                }
//                        );
//            }
//        }
//    }
//}
