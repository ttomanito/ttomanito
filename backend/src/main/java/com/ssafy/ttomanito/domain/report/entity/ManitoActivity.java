//package com.ssafy.ttomanito.domain.report.entity;
//
//import com.ssafy.ttomanito.domain.room.entity.RoomUser;
//import jakarta.persistence.*;
//        import lombok.*;
//
//@Getter
//@Builder(toBuilder = true)
//@NoArgsConstructor(access = AccessLevel.PROTECTED)
//@AllArgsConstructor(access = AccessLevel.PRIVATE)
//@Entity
//@Table(name = "manito_activity")
//public class ManitoActivity {
//
//    @Id
//    @OneToOne(fetch = FetchType.LAZY, optional = false)
//    @JoinColumn(name = "room_user_id", nullable = false)
//    private RoomUser roomUser;
//
//    @Column(name = "chat_count")
//    private Integer chatCount;
//
//    @Column(name = "call_time")
//    private Integer callTime;
//
//    @Column(name = "mission_success_count")
//    private Integer missionSuccessCount;
//
//    /** 포크(Poke) 횟수 – 차후 사용 */
//    @Column(name = "poke_count", nullable = false)
//    private int pokeCount;
//
//
//    public void increase(Genre genre, int delta) {
//        switch (genre) {
//            case CALL_TIME       -> this.callTime             += delta;
//            case CHAT_COUNT      -> this.chatCount            += delta;
//            case MISSION_SUCCESS -> this.missionSuccessCount  += delta;
//            case POKE            -> this.pokeCount            += delta;
//        }
//    }
//
//    public int metricOf(Genre genre) {
//        return switch (genre) {
//            case CALL_TIME       -> this.callTime;
//            case CHAT_COUNT      -> this.chatCount;
//            case MISSION_SUCCESS -> this.missionSuccessCount;
//            case POKE            -> this.pokeCount;
//        };
//    }
//}
