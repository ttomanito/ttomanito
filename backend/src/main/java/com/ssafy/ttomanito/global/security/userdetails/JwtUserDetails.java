package com.ssafy.ttomanito.global.security.userdetails;

import java.security.Principal;
import java.util.Collection;
import java.util.List;

import lombok.Getter;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

@Getter
public class JwtUserDetails implements UserDetails, Principal {
    private final Long userId;
    private final String username;

    public JwtUserDetails(Long userId, String username) {
        this.userId   = userId;
        this.username = username;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of();
    }

    @Override
    public String getPassword() {
        return "";
    }

    @Override
    public String getUsername() {
        return username;
    }

    @Override public boolean isAccountNonExpired() {
        return UserDetails.super.isAccountNonExpired();
    }
    @Override public boolean isAccountNonLocked() {
        return UserDetails.super.isAccountNonLocked();
    }
    @Override public boolean isCredentialsNonExpired() {
        return UserDetails.super.isCredentialsNonExpired();
    }
    @Override public boolean isEnabled() {
        return UserDetails.super.isEnabled();
    }

    @Override
    public String getName() {
        // Principal#getName() → 사용자 식별용 ID 반환
        return userId.toString();
    }

    @Override
    public String toString() {
        return "CustomUserDetails{userId=" + userId
                + ", username='" + username + "'}";
    }
}
