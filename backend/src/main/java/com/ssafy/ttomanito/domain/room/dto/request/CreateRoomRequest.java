package com.ssafy.ttomanito.domain.room.dto.request;


import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class CreateRoomRequest {
    private String name;
    private String statusMessage; // 초기 상태 메시지
}
