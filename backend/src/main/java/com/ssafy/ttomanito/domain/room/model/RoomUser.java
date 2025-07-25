package com.ssafy.ttomanito.domain.room.model;

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
    @GeneratedValue(strategy = GenerationType.IDENTITY)   // room_user_id가 AUTO_INCREMENT 라고 가정
    @Column(name = "room_user_id")
    private Long id;

    @Column(name = "room_id", nullable = false)
    private Long roomId;

    @Column(name = "user_id", nullable = false)
    private Long userId;   // BIGINT -> Long

    @Column(name = "status_message")
    private String statusMessage; // 입장 후 별도 API에서 1회 설정

    /** 정적 팩토리 */
    public static RoomUser of(Long roomId, Long userId) {
        return RoomUser.builder()
                .roomId(roomId)
                .userId(userId)
                .build();
    }

    /** 상태메시지 세팅(여러 번 허용/비허용은 서비스에서 정책으로 제어) */
    public void setStatusMessage(String message) {
        this.statusMessage = message;
    }

    /** 방 나갈 때 메시지를 비워두고 싶다면 사용 */
    public void resetStatusMessage() {
        this.statusMessage = null;
    }
}
