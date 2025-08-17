package com.ssafy.ttomanito.domain.mission.entity;

import com.ssafy.ttomanito.domain.room.entity.RoomUser;
import com.ssafy.ttomanito.domain.user.entity.User;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.time.ZoneId;

@Entity
@Table(name = "mission_status")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EntityListeners(AuditingEntityListener.class)
public class MissionStatus {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "mission_status_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "daily_mission_id", nullable = false)
    private DailyMission dailyMission;

    @Column(name = "completed", nullable = false)
    private boolean completed;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_user_id", nullable = false)
    private RoomUser roomUser;

    @CreatedDate
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    // 생성자
    public MissionStatus(User user, RoomUser roomUser, DailyMission dailyMission, boolean completed) {
        this.user = user;
        this.roomUser = roomUser;
        this.dailyMission = dailyMission;
        this.completed = completed;
    }

    // 도메인 메서드
    public void complete() {
        this.completed = true;
        this.completedAt = LocalDateTime.now(ZoneId.of("Asia/Seoul"));
    }
}
