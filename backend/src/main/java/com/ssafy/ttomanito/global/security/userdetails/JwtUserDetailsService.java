package com.ssafy.ttomanito.global.security.userdetails;

import com.ssafy.ttomanito.domain.user.entity.User;
import com.ssafy.ttomanito.domain.user.entity.User.UserStatus;
import com.ssafy.ttomanito.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class JwtUserDetailsService implements UserDetailsService {
    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String userIdStr) {
        long userId;
        try {
            userId = Long.parseLong(userIdStr);
        } catch (NumberFormatException ex) {
            throw new UsernameNotFoundException("Invalid user ID: " + userIdStr);
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new UsernameNotFoundException("User not found id=" + userId)
                );

        if (user.getStatus() == UserStatus.WITHDRAWN) {
            throw new DisabledException("탈퇴된 사용자입니다.");
        }

        return new JwtUserDetails(user);
    }
}
