package com.ssafy.ttomanito.domain.manito.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ManitoAssignment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long manitoAssignmentId;

    private Long manitoId;

    private Long maniteeId;

    private Long roomId;

    @Builder
    private ManitoAssignment(Long manitoId, Long maniteeId, Long roomId) {
        this.manitoId = manitoId;
        this.maniteeId = maniteeId;
        this.roomId = roomId;
    }

    public static ManitoAssignment create(Long manitoId, Long maniteeId, Long roomId) {
        return ManitoAssignment.builder()
                .manitoId(manitoId)
                .maniteeId(maniteeId)
                .roomId(roomId)
                .build();
    }
}
