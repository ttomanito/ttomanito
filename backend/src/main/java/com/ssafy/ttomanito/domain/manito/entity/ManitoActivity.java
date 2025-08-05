//package com.ssafy.ttomanito.domain.manito.entity;
//
//import com.ssafy.ttomanito.domain.room.entity.RoomUser;
//import jakarta.persistence.*;
//import lombok.*;
//
//@Entity
//@Table(name = "manito_activity")
//@Getter
//@NoArgsConstructor(access = AccessLevel.PROTECTED)
//@AllArgsConstructor(access = AccessLevel.PRIVATE)
//@Builder(toBuilder = true)
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
//    @Column(name = "poke_count")
//    private Integer pokeCount;
//}
