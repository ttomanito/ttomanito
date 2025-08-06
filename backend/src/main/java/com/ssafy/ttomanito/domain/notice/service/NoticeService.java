package com.ssafy.ttomanito.domain.notice.service;

import com.ssafy.ttomanito.domain.manito.entity.ManitoAssignment;
import com.ssafy.ttomanito.domain.manito.repository.ManitoAssignmentRepository;
import com.ssafy.ttomanito.domain.notice.dto.NoticeResponse;
import com.ssafy.ttomanito.domain.notice.entity.Notice;
import com.ssafy.ttomanito.domain.notice.entity.NoticeType;
import com.ssafy.ttomanito.domain.notice.repository.NoticeRepository;
import com.ssafy.ttomanito.domain.room.entity.RoomStatus;
import com.ssafy.ttomanito.domain.room.entity.RoomUser;
import com.ssafy.ttomanito.domain.room.repository.RoomUserRepository;
import com.ssafy.ttomanito.domain.user.entity.User;
import com.ssafy.ttomanito.global.security.userdetails.JwtUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.PostMapping;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NoticeService {

    private final NoticeRepository noticeRepository;
    private final ManitoAssignmentRepository manitoAssignmentRepository;
    private final RoomUserRepository roomUserRepository;

    public List<NoticeResponse> getNotices(Long userId) {
        return noticeRepository.findByUser_UserIdAndCheckFalseOrderByNoticeIdDesc(userId).stream()
                .map(NoticeResponse::from)
                .toList();
    }

    @Transactional
    public void markAllAsRead(Long userId) {
        List<Notice> unreadNotices = noticeRepository.findByUser_UserIdAndCheckFalse(userId);

        for (Notice notice : unreadNotices) {
            notice.markAsRead();
        }

        // 변경 감지는 JPA의 영속성 컨텍스트로 자동 처리됨
    }
    @Transactional
    public void deleteAllNotices(Long userId) {
        noticeRepository.deleteAllByUser_UserId(userId);
    }

    @Transactional
    public void createPokeNotice(Long userId) {
        // 현재 사용자의 RoomUser 조회
        RoomUser current = roomUserRepository
                .findActiveRoomsForUser(userId, List.of(RoomStatus.NOT_STARTED, RoomStatus.IN_PROGRESS))
                .stream()
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("참여 중인 방이 없습니다."));
        Long ruId = current.getRoomUserId();
        Long roomId = current.getRoom().getRoomId();

        ManitoAssignment assign = manitoAssignmentRepository
                .findByManitee_RoomUserIdAndRoom_RoomId(ruId, roomId)
                .orElseThrow(() -> new IllegalArgumentException("마니또 정보가 없습니다."));
        User manito = assign.getManito().getUser();

        noticeRepository.save(Notice.of(manito, NoticeType.POKE));
    }

    @Transactional
    public void createGuessNotice(Long userId) {
        // 현재 사용자의 RoomUser 조회
        RoomUser current = roomUserRepository
                .findActiveRoomsForUser(userId, List.of(RoomStatus.NOT_STARTED, RoomStatus.IN_PROGRESS))
                .stream()
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("참여 중인 방이 없습니다."));
        Long ruId = current.getRoomUserId();
        Long roomId = current.getRoom().getRoomId();

        ManitoAssignment assign = manitoAssignmentRepository
                .findByManitee_RoomUserIdAndRoom_RoomId(ruId, roomId)
                .orElseThrow(() -> new IllegalArgumentException("마니또 정보가 없습니다."));
        User manito = assign.getManito().getUser();

        noticeRepository.save(Notice.of(manito, NoticeType.GUESS));
    }

    private User findMyManito(Long userId) {
        RoomUser current = roomUserRepository
                .findActiveRoomsForUser(userId, List.of(RoomStatus.NOT_STARTED, RoomStatus.IN_PROGRESS))
                .stream()
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("참여 중인 방이 없습니다."));
        Long ruId = current.getRoomUserId();
        Long roomId = current.getRoom().getRoomId();

        return manitoAssignmentRepository
                .findByManitee_RoomUserIdAndRoom_RoomId(ruId, roomId)
                .orElseThrow(() -> new IllegalArgumentException("마니또 정보가 없습니다."))
                .getManito()
                .getUser();
    }

    @Transactional
    public void createFinishNoticeForRoom(Long roomId) {
        List<RoomUser> roomUsers = roomUserRepository.findByRoom_RoomId(roomId);
        for (RoomUser ru : roomUsers) {
            Notice notice = Notice.of(ru.getUser(), NoticeType.FINISHED);
            noticeRepository.save(notice);
        }
    }

    @Transactional
    public void createExitNotices(Long userId) {
        // 현재 사용자의 RoomUser 조회
        RoomUser current = roomUserRepository
                .findActiveRoomsForUser(userId, List.of(RoomStatus.NOT_STARTED, RoomStatus.IN_PROGRESS))
                .stream()
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("참여 중인 방이 없습니다."));
        Long ruId = current.getRoomUserId();
        Long roomId = current.getRoom().getRoomId();

        // 내가 마니띠라면 → 마니또에게 SYSTEM 알림
        manitoAssignmentRepository
                .findByManitee_RoomUserIdAndRoom_RoomId(ruId, roomId)
                .ifPresent(assign -> noticeRepository.save(
                        Notice.of(assign.getManito().getUser(), NoticeType.SYSTEM)
                ));

        // 내가 마니또라면 → 마니띠에게 SYSTEM 알림
        manitoAssignmentRepository
                .findByManito_RoomUserIdAndRoom_RoomId(ruId, roomId)
                .ifPresent(assign -> noticeRepository.save(
                        Notice.of(assign.getManitee().getUser(), NoticeType.SYSTEM)
                ));
    }


}
