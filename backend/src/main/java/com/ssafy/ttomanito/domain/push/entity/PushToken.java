package com.ssafy.ttomanito.domain.push.entity;

import com.ssafy.ttomanito.domain.user.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.time.ZoneId;

@Entity
@Table(name="push_token")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@Builder(toBuilder = true)
public class PushToken {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long pushTokenId;

    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, unique = true, length = 500)
    private String token;

    @Column(nullable = false)
    private boolean enabled;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    public void enable()  { this.enabled = true; }
    public void disable() { this.enabled = false; }
    public void changeOwner(User newOwner) { this.user = newOwner; }

    @PrePersist @PreUpdate
    void touch() { this.updatedAt = LocalDateTime.now(ZoneId.of("Asia/Seoul")); }}