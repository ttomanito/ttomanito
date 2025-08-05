package com.ssafy.ttomanito.domain.poke.repository;

import com.ssafy.ttomanito.domain.poke.entity.PokeLog;
import com.ssafy.ttomanito.domain.room.entity.RoomUser;
import com.ssafy.ttomanito.domain.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PokeLogRepository extends JpaRepository<PokeLog, Long> {
    // 내가 찌른 마니또들

    // 나를 마니띠로 한 assignment를 기준으로 찔림 기록
    List<PokeLog> findByAssignment_Manito(User manito);

    // 나를 마니또로 한 사람들 (내가 찔린 경우)
    List<PokeLog> findByAssignment_Manitee(User manitee);

}
