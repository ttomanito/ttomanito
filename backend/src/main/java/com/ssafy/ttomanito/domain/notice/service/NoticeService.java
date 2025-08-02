package com.ssafy.ttomanito.domain.notice.service;

import com.ssafy.ttomanito.domain.notice.dto.NoticeResponse;
import com.ssafy.ttomanito.domain.notice.entity.Notice;
import com.ssafy.ttomanito.domain.notice.repository.NoticeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NoticeService {

    private final NoticeRepository noticeRepository;

    public List<NoticeResponse> getNotices(Long userId) {
        List<Notice> noticeList = noticeRepository.findAllByUser_UserIdOrderByNoticeIdDesc(userId);
        return noticeList.stream()
                .map(NoticeResponse::from)
                .toList();
    }

    public void deleteAllNotices(Long userId) {
        noticeRepository.deleteAllByUser_UserId(userId);
    }
}
