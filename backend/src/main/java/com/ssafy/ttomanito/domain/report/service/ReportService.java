//package com.ssafy.ttomanito.domain.report.service;
//
//import com.ssafy.ttomanito.domain.manito.entity.ManitoActivity;
//import com.ssafy.ttomanito.domain.manito.repository.ManitoActivityRepository;
//import com.ssafy.ttomanito.domain.report.dto.ReportComparisonDto;
//import lombok.RequiredArgsConstructor;
//import org.springframework.stereotype.Service;
//
//import java.util.List;
//
//@Service
//@RequiredArgsConstructor
//public class ReportService {
//    private final ManitoActivityRepository activityRepo;
//
//    public ReportComparisonDto compareMyActivity(Long roomId, Long userId) {
//        // 1) 내 활동값 조회
//        long myCallTime    = activityRepo.sumCallTimeByRoomAndUser(roomId, userId);
//        int  myChatCount   = activityRepo.sumChatCountByRoomAndUser(roomId, userId);
//        int  myPokeCount   = pokeRepo.countByRoomAndUser(roomId, userId);
//
//        // 2) 그룹 평균값 계산
//        double avgCallTime  = activityRepo.avgCallTimeByRoom(roomId);
//        double avgChatCount = activityRepo.avgChatCountByRoom(roomId);
//        double avgPokeCount = pokeRepo.avgPokeCountByRoom(roomId);
//
//        // 3) DTO 로 묶어서 반환
//        return new ReportComparisonDto(
//                avgCallTime, myCallTime,
//                avgChatCount, myChatCount,
//                avgPokeCount, myPokeCount
//        );
//    }
//
//}
