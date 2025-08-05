package com.ssafy.ttomanito.domain.chatting.user.entity;

import com.ssafy.ttomanito.domain.chatting.room.entity.ChattingRoom;
import com.ssafy.ttomanito.domain.room.entity.RoomUser;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "chatting_user")
@IdClass(ChattingUserId.class)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@Builder(toBuilder = true)
public class ChattingUser {

    @Id
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "chatting_room_id", nullable = false)
    private ChattingRoom chattingRoom;

    @Id
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "room_user_id", nullable = false)
    private RoomUser roomUser;

    @Column(name = "unread_count")
    private Integer unreadCount;

    @Column(name = "last_read_time")
    private LocalDateTime lastReadTime;
}
