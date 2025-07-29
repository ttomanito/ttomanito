package com.ssafy.ttomanito.global.security.userdetails;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.ssafy.ttomanito.domain.user.entity.User;
import com.ssafy.ttomanito.domain.user.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class JwtUserDetailsService implements UserDetailsService {
    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String userIdStr) {
        Long userId;
        try {
            userId = Long.parseLong(userIdStr);
        } catch (NumberFormatException ex) {
            throw new UsernameNotFoundException("Invalid user ID: " + userIdStr);
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new UsernameNotFoundException("User not found id=" + userId)
                );

        return new JwtUserDetails(user.getUserId(), user.getName());
    }
}
