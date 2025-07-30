package com.ssafy.ttomanito.domain.oauth.repository;

import java.util.Optional;

import com.ssafy.ttomanito.domain.oauth.entity.OAuthIdentity;
import com.ssafy.ttomanito.domain.oauth.entity.OAuthIdentity.OAuthProvider;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface OAuthRepository extends JpaRepository<OAuthIdentity, Long> {
    @EntityGraph(attributePaths = "user")
    Optional<OAuthIdentity> findWithUserByProviderIdAndProvider(String providerId, OAuthProvider provider);
    @Modifying
    @Query("delete from OAuthIdentity oi where oi.user.userId = :userId")
    void deleteByUserId(@Param("userId") Long userId);
}
