package com.ssafy.ttomanito.domain.oauth.repository;

import java.util.Optional;

import com.ssafy.ttomanito.domain.oauth.entity.OAuthIdentity;
import com.ssafy.ttomanito.domain.oauth.entity.OAuthIdentity.OAuthProvider;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OAuthRepository extends JpaRepository<OAuthIdentity, Long> {
    Optional<OAuthIdentity> findWithUserByProviderIdAndProvider(String providerId, OAuthProvider provider);
}
