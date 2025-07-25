package com.ssafy.ttomanito.domain.room.dto.response;

import com.ssafy.ttomanito.domain.room.model.Room;
import com.ssafy.ttomanito.domain.room.model.RoomStatus;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter @Builder
public class RoomInfoResponse {
    private Long roomId;
    private Long creatorId;
    private String name;
    private RoomStatus status;
    private LocalDate startDate;
    private LocalDate endDate;

    public static RoomInfoResponse from(Room r) {
        return RoomInfoResponse.builder()
                .roomId(r.getId())
                .creatorId(r.getCreatorId())
                .name(r.getName())
                .status(r.getStatus())
                .startDate(r.getStartDate())
                .endDate(r.getEndDate())
                .build();
    }
}

