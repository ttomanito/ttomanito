package com.ssafy.ttomanito.domain.oauth.entity;

import com.ssafy.ttomanito.domain.user.entity.User;
import lombok.*;
import jakarta.persistence.*;

@Entity
@Table(name = "oauth_identity")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@Builder(toBuilder = true)
public class OAuthIdentity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "oauth_identity_id")
    private Long oauthIdentityId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(name = "provider", nullable = false, length = 50)
    private OAuthProvider provider;

    @Column(name = "provider_id", nullable = false, length = 255)
    private String providerId;

    public enum OAuthProvider {
        KAKAO,
        NAVER,
        GOOGLE;

        public static OAuthProvider from(String registrationId) {
            return switch (registrationId.toLowerCase()) {
                case "kakao"  -> KAKAO;
                case "naver"  -> NAVER;
                case "google" -> GOOGLE;
                default -> throw new IllegalArgumentException("Unknown OAuthProvider: " + registrationId);
            };
        }
    }
}