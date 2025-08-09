package com.ssafy.ttomanito.domain.manito.entity;

import com.ssafy.ttomanito.domain.room.entity.RoomUser;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "manito_activity")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@Builder(toBuilder = true)
public class ManitoActivity {

    @Id
    @Column(name = "room_user_id")
    private Long roomUserId;

    @Version
    Integer version;

    /* @MapsId로 FK를 위 roomUserId와 공유 */
    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @MapsId
    @JoinColumn(name = "room_user_id", nullable = false)
    private RoomUser roomUser;

    @Column(name = "chat_count", nullable = false)
    private Integer chatCount;

    @Column(name = "call_time", nullable = false)
    private Integer callTime;

    @Column(name = "mission_success_count", nullable = false)
    private Integer missionSuccessCount;

    @Column(name = "poke_count", nullable = false)
    private Integer pokeCount;

    public void updateCounts(int pokeCount,
                             int chatCount,
                             int callTime,
                             int missionSuccessCount) {
        this.pokeCount = pokeCount;
        this.chatCount = chatCount;
        this.callTime = callTime;
        this.missionSuccessCount = missionSuccessCount;
    }
}