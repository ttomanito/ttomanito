package com.ssafy.ttomanito.domain.room.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(
        name = "room_user",
        uniqueConstraints = @UniqueConstraint(columnNames = {"room_id", "user_id"})
)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@Builder
public class RoomUser {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "room_user_id")
    private Long id;

    @Column(name = "room_id", nullable = false)
    private Long roomId;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "status_message")
    private String statusMessage;

    // 정적 팩토리 메서드
    public static RoomUser of(Long roomId, Long userId) {
        return RoomUser.builder()
                .roomId(roomId)
                .userId(userId)
                .statusMessage(null)  // ✅ 명시적으로 null
                .build();
    }

    // 상태메시지 설정 (1회 제한 여부는 서비스 로직에서 제어)
    public void setStatusMessage(String message) {
        this.statusMessage = message;
    }

    // 상태메시지 초기화
    public void resetStatusMessage() {
        this.statusMessage = null;
    }
}
