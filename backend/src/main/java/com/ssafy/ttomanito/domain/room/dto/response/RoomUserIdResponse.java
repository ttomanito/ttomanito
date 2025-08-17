package com.ssafy.ttomanito.domain.room.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;

public record RoomUserIdResponse(
        @Schema(description = "room_user PK") Long roomUserId
) {}