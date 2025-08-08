package com.ssafy.ttomanito.domain.room.dto.response;

import com.ssafy.ttomanito.domain.room.entity.Room;
import com.ssafy.ttomanito.domain.room.entity.RoomStatus;
import com.ssafy.ttomanito.domain.room.entity.Weekday;

import java.time.LocalDate;
import java.util.List;


public record RoomInfoResponse(
        Long roomId,
        Long creatorId,
        String name,
        RoomStatus status,

        LocalDate startDate,
        LocalDate endDate,   // 내부 확인용(필요 없으면 제거 가능)
        List<Weekday> missionDays
) {
    public static RoomInfoResponse from(Room r, List<Weekday> days) {
        return new RoomInfoResponse(
                r.getRoomId(),
                r.getCreator().getUserId(),
                r.getName(),
                r.getStatus(),
                r.getStartDate(),
                r.getEndDate(),
                days
        );
    }
}

