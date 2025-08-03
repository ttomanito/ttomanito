package com.ssafy.ttomanito.domain.manito.repository;

import com.ssafy.ttomanito.domain.manito.entity.ManitoAssignment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ManitoAssignmentRepository extends JpaRepository<ManitoAssignment, Long> {
<<<<<<< HEAD

    /** 방 PK로 매니또 할당 조회 */
    List<ManitoAssignment> findByRoom_RoomId(Long roomId);

    /** 방 PK로 매니또 할당 일괄 삭제 */
    void deleteByRoom_RoomId(Long roomId);
<<<<<<< HEAD
=======
    Optional<ManitoAssignment> findByManitoIdAndRoomId(Long manitoId, Long roomId);
    // 마니띠가 guessUserId이고 마니또가 guessedUserId이며 room이 일치하는 기록이 존재하는지
    boolean existsByManiteeIdAndManitoIdAndRoomId(Long maniteeId, Long manitoId, Long roomId);
>>>>>>> b50e0e8 (feat: manito/guess api)
=======

<<<<<<< HEAD
<<<<<<< HEAD
    Optional<ManitoAssignment> findByManitee_UserIdAndRoom_RoomId(Long maniteeId, Long roomId);
>>>>>>> d4ff38c (feat: notice-list/delete)
=======
    Optional<ManitoAssignment> findByManitee_UserId(Long maniteeId);

    Optional<ManitoAssignment> findByManito_UserId(Long userId);
>>>>>>> e74082f (feat: poke,guess and modify roomuserrepository,manitorepository)
=======
    Optional<ManitoAssignment> findByManitee_UserId(Long userId);

    Optional<ManitoAssignment> findByManito_UserId(Long userId);


>>>>>>> eb0fa31 (chore: roomcontroller)
}

