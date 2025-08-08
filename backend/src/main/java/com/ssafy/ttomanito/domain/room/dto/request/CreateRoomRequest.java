package com.ssafy.ttomanito.domain.room.dto.request;

import com.ssafy.ttomanito.domain.room.entity.Weekday;

import java.time.LocalDate;
import java.util.List;

public record CreateRoomRequest(
        String name,
        LocalDate deadline,          // = room.endDate
        List<Weekday> missionDays
) {
}
