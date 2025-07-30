package com.ssafy.ttomanito.global.security.userdetails;

import java.security.Principal;
import java.util.Collection;
import java.util.List;

import com.ssafy.ttomanito.domain.user.entity.User;
import com.ssafy.ttomanito.domain.user.entity.User.UserStatus;
import lombok.Getter;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

@Getter
public class JwtUserDetails implements UserDetails, Principal {
    private final Long userId;
    private final String username;
    private final UserStatus status;
    private final Collection<? extends GrantedAuthority> authorities;

    public JwtUserDetails(User user) {
        this.userId = user.getUserId();
        this.username = user.getName();
        this.status = user.getStatus();
        this.authorities = List.of(new SimpleGrantedAuthority("ROLE_USER"));
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
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
        return this.status.equals(UserStatus.ACTIVE);
    }

    @Override
    public String getName() {
        return userId.toString();
    }
}
