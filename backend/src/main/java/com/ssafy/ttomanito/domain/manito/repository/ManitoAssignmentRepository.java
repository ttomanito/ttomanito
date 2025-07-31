package com.ssafy.ttomanito.domain.manito.repository;

import com.ssafy.ttomanito.domain.manito.entity.ManitoAssignment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ManitoAssignmentRepository extends JpaRepository<ManitoAssignment, Long> {

    /** 방 PK로 매니또 할당 조회 */
    List<ManitoAssignment> findByRoom_RoomId(Long roomId);

    /** 방 PK로 매니또 할당 일괄 삭제 */
    void deleteByRoom_RoomId(Long roomId);
}
