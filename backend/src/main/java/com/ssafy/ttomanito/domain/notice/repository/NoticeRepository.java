package com.ssafy.ttomanito.domain.notice.repository;

import com.ssafy.ttomanito.domain.notice.entity.Notice;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NoticeRepository extends JpaRepository<Notice, Long> {

    /**
     * user 기준 알림 목록 최신순 조회
     */
    List<Notice> findByUser_UserIdAndCheckFalseOrderByNoticeIdDesc(Long userId);

    List<Notice> findByUser_UserIdAndCheckFalse(Long userId);

    void deleteAllByUser_UserId(Long userId);


}
