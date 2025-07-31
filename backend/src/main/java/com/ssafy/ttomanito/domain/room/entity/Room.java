package com.ssafy.ttomanito.domain.room.entity;

import com.ssafy.ttomanito.domain.user.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "room")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@Builder(toBuilder = true)
public class Room {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "room_id")
    private Long roomId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "creator_id", nullable = false)
    private User creator;

    @Column(length = 100)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private RoomStatus status;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @OneToMany(mappedBy = "room", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<MissionDay> missionDays = new ArrayList<>();

    public static Room create(User creator, String name) {
        return Room.builder()
                .creator(creator)
                .name(name)
                .status(RoomStatus.NOT_STARTED)
                .build();
    }

    public void markAsNone() {
        this.status = RoomStatus.NONE;
    }

    public void start(LocalDate when) {
        this.status = RoomStatus.IN_PROGRESS;
        this.startDate = when;
        this.endDate = null;
    }

    public void finish(LocalDate when) {
        this.status = RoomStatus.FINISHED;
        this.endDate = when;
    }
}
