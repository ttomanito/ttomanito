package com.ssafy.ttomanito.domain.notice.service;

import com.ssafy.ttomanito.domain.notice.dto.NoticeResponse;
import com.ssafy.ttomanito.domain.notice.entity.Notice;
import com.ssafy.ttomanito.domain.notice.repository.NoticeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NoticeService {

    private final NoticeRepository noticeRepository;

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

    public void deleteAllNotices(Long userId) {
        noticeRepository.deleteAllByUser_UserId(userId);
    }
}
