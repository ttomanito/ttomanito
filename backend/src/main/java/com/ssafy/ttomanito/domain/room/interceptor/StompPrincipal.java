package com.ssafy.ttomanito.domain.room.interceptor;

import java.security.Principal;

public final class StompPrincipal implements Principal {
    private final Long userId;
    public StompPrincipal(Long userId) { this.userId = userId; }
    @Override public String getName() { return String.valueOf(userId); }
    public Long getUserId() { return userId; }
}
