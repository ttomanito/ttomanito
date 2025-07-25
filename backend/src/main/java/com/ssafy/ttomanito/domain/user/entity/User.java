package com.ssafy.ttomanito.domain.user.entity;

import lombok.*;
import jakarta.persistence.*;
import java.time.LocalDateTime;


@Entity
@Table(name = "user")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@Builder(toBuilder = true)
public class User {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private Long userId;

    @Column(name = "name", nullable = false, length = 50)
    private String name;

    @Column(name = "joined_at", nullable = false)
    private LocalDateTime joinedAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 50)
    private UserStatus status;

    public enum UserStatus {
        ACTIVE,
        WITHDRAWN
    }
}