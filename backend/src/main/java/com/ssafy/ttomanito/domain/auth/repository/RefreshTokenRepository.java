package com.ssafy.ttomanito.domain.auth.repository;

import com.ssafy.ttomanito.domain.auth.entity.RefreshToken;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RefreshTokenRepository
        extends CrudRepository<RefreshToken, String> {
}
