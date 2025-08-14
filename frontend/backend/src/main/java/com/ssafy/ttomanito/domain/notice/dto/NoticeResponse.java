package com.ssafy.ttomanito.domain.notice.dto;

import com.ssafy.ttomanito.domain.notice.entity.Notice;
import com.ssafy.ttomanito.domain.notice.entity.NoticeType;

public record NoticeResponse(
        Long noticeId,              // 알림 고유 ID
        NoticeType type,            // 알림 종류 (GUESS, EXIT, etc)
        boolean check               //읽음 여부
) {
    public static NoticeResponse from(Notice notice) {
        return new NoticeResponse(
                notice.getNoticeId(),
                notice.getType(),
                notice.isCheck()
        );
    }
}
