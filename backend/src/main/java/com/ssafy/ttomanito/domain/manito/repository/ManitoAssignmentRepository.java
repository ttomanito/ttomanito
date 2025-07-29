package com.ssafy.ttomanito.domain.manito.repository;

import com.ssafy.ttomanito.domain.manito.entity.ManitoAssignment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ManitoAssignmentRepository extends JpaRepository<ManitoAssignment, Long> {

    List<ManitoAssignment> findByRoomId(Long roomId);

    void deleteByRoomId(Long roomId);
}
