package com.ssafy.ttomanito.domain.auth.repository;

import com.ssafy.ttomanito.domain.auth.entity.RefreshToken;
import org.springframework.data.keyvalue.repository.KeyValueRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RefreshTokenRepository
        extends KeyValueRepository<RefreshToken, String> {
}
