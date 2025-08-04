package com.ssafy.ttomanito.domain.notice.entity;

import com.ssafy.ttomanito.domain.user.entity.User;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "notification")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@Builder
public class Notice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "notification_id")
    private Long noticeId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(length = 50, nullable = false)
    private NoticeType type;

    @Column(name = "`check`", nullable = false)
    private boolean check;

    public static Notice of(User user, NoticeType type) {
        return Notice.builder()
                .user(user)
                .type(type)
                .check(false)
                .build();
    }

    public void markAsRead() {
        this.check = true;
    }
}
