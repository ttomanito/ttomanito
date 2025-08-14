package com.ssafy.ttomanito.domain.poke.entity;

import com.ssafy.ttomanito.domain.manito.entity.ManitoAssignment;
import com.ssafy.ttomanito.domain.room.entity.RoomUser;
import com.ssafy.ttomanito.domain.user.entity.User;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "poke_log")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@EntityListeners(AuditingEntityListener.class)
@Builder(toBuilder = true)
public class PokeLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "poke_id")
    private Long pokeId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "manito_id", nullable = false)
    private User manito;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "manitee_id", nullable = false)
    private User manitee;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "manito_assignment_id", nullable = false)
    private ManitoAssignment assignment;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_user_id", nullable = false)
    private RoomUser roomUser;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

}
