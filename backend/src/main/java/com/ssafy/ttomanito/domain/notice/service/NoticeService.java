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
import com.ssafy.ttomanito.global.exception.NotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
public class NoticeService {

    private final NoticeRepository noticeRepository;
    private final ManitoAssignmentRepository manitoAssignmentRepository;
    private final RoomUserRepository roomUserRepository;

    public List<NoticeResponse> getNotices(Long userId) {
        return noticeRepository.findByUser_UserIdAndCheckFalseOrderByNoticeIdDesc(userId)
                .stream()
                .map(NoticeResponse::from)
                .toList();
    }

    public void markAllAsRead(Long userId) {
        List<Notice> unreadNotices = noticeRepository.findByUser_UserIdAndCheckFalse(userId);
        if (unreadNotices.isEmpty()) {
            throw new NotFoundException("읽지 않은 알림이 없습니다");
        }
        unreadNotices.forEach(Notice::markAsRead);
    }

    public void deleteAllNotices(Long userId) {
        noticeRepository.deleteAllByUser_UserId(userId);
    }

    public void createPokeNotice(Long userId) {
        User manito = findMyManito(userId);
        noticeRepository.save(Notice.of(manito, NoticeType.POKE));
    }

    public void createGuessNotice(Long userId) {
        User manito = findMyManito(userId);
        noticeRepository.save(Notice.of(manito, NoticeType.GUESS));
    }

    private User findMyManito(Long userId) {
        RoomUser current = roomUserRepository
                .findActiveRoomsForUser(userId, List.of(RoomStatus.NOT_STARTED, RoomStatus.IN_PROGRESS))
                .stream().findFirst()
                .orElseThrow(() -> new NotFoundException("참여 중인 방이 없습니다"));

        ManitoAssignment assign = manitoAssignmentRepository
                .findByManitee_RoomUserIdAndRoom_RoomId(current.getRoomUserId(), current.getRoom().getRoomId())
                .orElseThrow(() -> new NotFoundException("마니또 배정 정보가 없습니다"));
        return assign.getManito().getUser();
    }

    public void createFinishNoticeForRoom(Long roomId) {
        List<RoomUser> users = roomUserRepository.findByRoom_RoomId(roomId);
        if (users.isEmpty()) {
            throw new NotFoundException("해당 방의 사용자가 없습니다: roomId=" + roomId);
        }
        users.forEach(ru -> {
            Notice notice = Notice.of(ru.getUser(), NoticeType.FINISHED);
            noticeRepository.save(notice);
        });
    }

    public void createExitNotices(Long userId) {
        RoomUser current = roomUserRepository
                .findActiveRoomsForUser(userId, List.of(RoomStatus.NOT_STARTED, RoomStatus.IN_PROGRESS))
                .stream().findFirst()
                .orElseThrow(() -> new NotFoundException("참여 중인 방이 없습니다"));

        // 내가 마니띠면
        manitoAssignmentRepository
                .findByManitee_RoomUserIdAndRoom_RoomId(current.getRoomUserId(), current.getRoom().getRoomId())
                .ifPresent(assign -> noticeRepository.save(
                        Notice.of(assign.getManito().getUser(), NoticeType.SYSTEM)
                ));

        // 내가 마니또면
        manitoAssignmentRepository
                .findByManito_RoomUserIdAndRoom_RoomId(current.getRoomUserId(), current.getRoom().getRoomId())
                .ifPresent(assign -> noticeRepository.save(
                        Notice.of(assign.getManitee().getUser(), NoticeType.SYSTEM)
                ));
    }
}
