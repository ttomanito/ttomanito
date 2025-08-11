package com.ssafy.ttomanito.domain.report.service;

import com.ssafy.ttomanito.domain.chatting.message.repository.ChatMessageRepository;
import com.ssafy.ttomanito.domain.chatting.voice.repository.VoiceChatRepository;
import com.ssafy.ttomanito.domain.manito.repository.ManitoAssignmentRepository;
import com.ssafy.ttomanito.domain.manito.repository.ManitoGuessRepository;
import com.ssafy.ttomanito.domain.mission.repository.MissionStatusRepository;
import com.ssafy.ttomanito.domain.poke.repository.PokeLogRepository;
import com.ssafy.ttomanito.domain.report.dto.GivingHelpDto;
import com.ssafy.ttomanito.domain.report.dto.MissionItemDto;
import com.ssafy.ttomanito.domain.report.dto.PairStatsDto;
import com.ssafy.ttomanito.domain.report.dto.ReceivingHelpDto;
import com.ssafy.ttomanito.domain.report.dto.ReportDetailResponseDto;
import com.ssafy.ttomanito.domain.room.entity.RoomUser;
import com.ssafy.ttomanito.domain.room.repository.RoomUserRepository;
import com.ssafy.ttomanito.global.exception.NotFoundException;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final RoomUserRepository roomUserRepo;
    private final ManitoAssignmentRepository assignRepo;
    private final ManitoGuessRepository manitoGuessRepo;
    private final VoiceChatRepository voiceRepo;
    private final MissionStatusRepository missionRepo;
    private final PokeLogRepository pokeRepo;              // 레포 변경 없음
    private final ChatMessageRepository chatRepo;          // 레포 변경 없음

    @PersistenceContext
    private EntityManager em;                              // JPQL로 poke 집계

    @Transactional(readOnly = true)
    public List<ReportDetailResponseDto> getFinishedReportHistory(Long userId) {
        List<RoomUser> myRus = roomUserRepo.findAllFinishedByUserId(userId);
        List<ReportDetailResponseDto> reports = new ArrayList<>();
        for (RoomUser ru : myRus) {
            reports.add(buildReportForRoom(ru.getRoom().getRoomId(), userId));
        }
        return reports;
    }

    private ReportDetailResponseDto buildReportForRoom(Long roomId, Long userId) {
        RoomUser me = roomUserRepo.findByRoomIdAndUserId(roomId, userId)
                .orElseThrow(() -> new NotFoundException("roomUser not found"));
        Long myRuId   = me.getRoomUserId();         // RoomUser PK
        Long myUserId = me.getUser().getUserId();   // User PK (manitee 비교용)

        // ===== 내가 '마니띠'인 배정 (receiving) =====
        var asReceiving = assignRepo.findByManitee_RoomUserIdAndRoom_RoomId(myRuId, roomId).orElse(null);

        ReceivingHelpDto receivingHelp;
        if (asReceiving != null) {
            Long assignId     = asReceiving.getManitoAssignmentId();
            Long manittoRuId  = asReceiving.getManito().getRoomUserId();

            // ★ assignment 기준 poke
            int pokeReceived  = countPokeReceivedInAssignment(assignId, myUserId); // 내가 받은(Manitee=나[User])
            int pokeSent      = countPokeSentInAssignment(assignId, myRuId);       // 내가 보낸(Manito=나[RoomUser])

            int pairChatCnt   = pairChatCountByAssignment(assignId, myRuId, manittoRuId);
            long pairCallSec  = pairCallSecondsByAssignment(assignId, myRuId, manittoRuId);

            int myCorrect     = manitoGuessRepo
                    .findByGuessUserIdAndGuessedUserId(myRuId, manittoRuId)
                    .size();

            List<MissionItemDto> missionsFromManitto =
                    missionRepo.findMissionsDoneByManitto(roomId, manittoRuId);

            var stats = new PairStatsDto(pokeReceived, pokeSent, pairChatCnt, pairCallSec, myCorrect);
            receivingHelp = new ReceivingHelpDto(asReceiving.getManito().getUser().getName(), stats, missionsFromManitto);
        } else {
            receivingHelp = new ReceivingHelpDto(null, new PairStatsDto(0,0,0,0,0), List.of());
        }

        // ===== 내가 '마니또'인 배정 (giving) =====
        var asGiving = assignRepo.findByManito_RoomUserIdAndRoom_RoomId(myRuId, roomId).orElse(null);

        GivingHelpDto givingHelp;
        if (asGiving != null) {
            Long assignId      = asGiving.getManitoAssignmentId();
            Long manitteeRuId  = asGiving.getManitee().getRoomUserId();

            // ★ assignment 기준 poke
            int pokeReceived   = countPokeReceivedInAssignment(assignId, myUserId); // 내가 받은
            int pokeSent       = countPokeSentInAssignment(assignId, myRuId);       // 내가 보낸

            int pairChatCnt    = pairChatCountByAssignment(assignId, myRuId, manitteeRuId);
            long pairCallSec   = pairCallSecondsByAssignment(assignId, myRuId, manitteeRuId);

            int myCorrectFromManittee = manitoGuessRepo
                    .findByGuessUserIdAndGuessedUserId(manitteeRuId, myRuId)
                    .size();

            List<MissionItemDto> missionsIDid =
                    missionRepo.findMissionsDoneByManitto(roomId, myRuId);

            var stats = new PairStatsDto(pokeReceived, pokeSent, pairChatCnt, pairCallSec, myCorrectFromManittee);
            givingHelp = new GivingHelpDto(asGiving.getManitee().getUser().getName(), stats, missionsIDid);
        } else {
            givingHelp = new GivingHelpDto(null, new PairStatsDto(0,0,0,0,0), List.of());
        }
        String roomName = me.getRoom().getName();
        return new ReportDetailResponseDto(roomId, roomName, receivingHelp, givingHelp);
    }

    /** 같은 assignment에서 내 duration + 상대 duration 합. */
    private long pairCallSecondsByAssignment(Long assignId, Long myRuId, Long otherRuId) {
        long mine = voiceRepo
                .findByChattingRoom_ManitoAssignment_ManitoAssignmentIdAndRoomUser_RoomUserId(assignId, myRuId)
                .map(vc -> (long) (vc.getDurationSec() == null ? 0 : vc.getDurationSec()))
                .orElse(0L);

        long others = voiceRepo
                .findByChattingRoom_ManitoAssignment_ManitoAssignmentIdAndRoomUser_RoomUserId(assignId, otherRuId)
                .map(vc -> (long) (vc.getDurationSec() == null ? 0 : vc.getDurationSec()))
                .orElse(0L);

        return mine + others;
    }

    /**
     * ChatRepo는 못 바꾸므로:
     * VoiceChat로 roomId를 우선 얻고, 없으면 두 sender(나/상대)가 모두 등장한 방 교집합에서
     * 합계가 가장 큰 방의 합을 사용.
     */
    private int pairChatCountByAssignment(Long assignId, Long myRuId, Long otherRuId) {
        LocalDateTime start = LocalDateTime.of(1970, 1, 1, 0, 0);
        LocalDateTime end   = LocalDateTime.now();

        var rows = chatRepo.countBySentAtBetweenGroupByRoomAndSender(start, end);

        // 1) VoiceChat 통해 roomId 유추
        String roomId = voiceRepo
                .findByChattingRoom_ManitoAssignment_ManitoAssignmentIdAndRoomUser_RoomUserId(assignId, myRuId)
                .map(vc -> String.valueOf(vc.getChattingRoom().getChattingRoomId()))
                .or(() -> voiceRepo
                        .findByChattingRoom_ManitoAssignment_ManitoAssignmentIdAndRoomUser_RoomUserId(assignId, otherRuId)
                        .map(vc -> String.valueOf(vc.getChattingRoom().getChattingRoomId()))
                )
                .orElse(null);

        if (roomId != null) {
            long sum = 0L;
            for (var row : rows) {
                ChatMessageRepository.ChatCount cc = (ChatMessageRepository.ChatCount) row;
                if (String.valueOf(cc.getChattingRoomId()).equals(roomId)) {
                    sum += cc.getCount();
                }
            }
            return safeToInt(sum);
        }

        // 2) roomId가 없으면 교집합 방식
        Map<String, Long> byRoomForMe    = new HashMap<>();
        Map<String, Long> byRoomForOther = new HashMap<>();

        for (var row : rows) {
            ChatMessageRepository.ChatCount cc = (ChatMessageRepository.ChatCount) row;
            String rid = String.valueOf(cc.getChattingRoomId());
            Long sender = cc.getSenderRoomUserId();
            if (sender == null) continue;

            long cnt = cc.getCount();
            if (Objects.equals(sender, myRuId)) {
                byRoomForMe.merge(rid, cnt, Long::sum);
            } else if (Objects.equals(sender, otherRuId)) {
                byRoomForOther.merge(rid, cnt, Long::sum);
            }
        }

        Set<String> candidateRooms = byRoomForMe.keySet().stream()
                .filter(byRoomForOther::containsKey)
                .collect(Collectors.toSet());

        if (candidateRooms.isEmpty()) return 0;

        long bestSum = -1L;
        for (String rid : candidateRooms) {
            long sum = byRoomForMe.getOrDefault(rid, 0L) + byRoomForOther.getOrDefault(rid, 0L);
            if (sum > bestSum) bestSum = sum;
        }
        return safeToInt(bestSum);
    }

    private int safeToInt(long v) {
        if (v > Integer.MAX_VALUE) return Integer.MAX_VALUE;
        if (v < Integer.MIN_VALUE) return Integer.MIN_VALUE;
        return (int) v;
    }

    // ========= JPQL 헬퍼: assignment 기준 poke 카운트 =========
    // PokeLog 필드명이 manito/manitee 라고 가정
    // (만약 manitee가 RoomUser면 .manitee.userId -> .manitee.roomUserId 로 변경)

    /** 내가 보낸 찌르기: assignment + manito(=내 roomUserId) */
    private int countPokeSentInAssignment(Long assignId, Long myRuId) {
        Long n = em.createQuery("""
            select count(p)
            from PokeLog p
            where p.assignment.manitoAssignmentId = :aid
              and p.manito.userId = :sid
        """, Long.class)
                .setParameter("aid", assignId)
                .setParameter("sid", myRuId)
                .getSingleResult();
        return n.intValue();
    }

    /** 내가 받은 찌르기: assignment + manitee(=내 userId) */
    private int countPokeReceivedInAssignment(Long assignId, Long myUserId) {
        Long n = em.createQuery("""
            select count(p)
            from PokeLog p
            where p.assignment.manitoAssignmentId = :aid
              and p.manitee.userId = :uid
        """, Long.class)
                .setParameter("aid", assignId)
                .setParameter("uid", myUserId)
                .getSingleResult();
        return n.intValue();
    }
}
