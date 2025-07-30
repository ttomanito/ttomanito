package com.ssafy.ttomanito.global.security.filter;

import com.ssafy.ttomanito.global.security.jwt.JwtProvider;
import com.ssafy.ttomanito.global.security.token.TokenRevocationService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.util.WebUtils;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    private final JwtProvider jwtProvider;
    private final TokenRevocationService tokenRevocationService;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain)
            throws ServletException, IOException {
        String header = request.getHeader(HttpHeaders.AUTHORIZATION);
        String token = jwtProvider.extractToken(header);

        if (token == null) {
            Cookie c = WebUtils.getCookie(request, "accessToken");
            if (c != null) {
                token = c.getValue();
            }
        }

        if (token != null
                && jwtProvider.isTokenValid(token)
                && !tokenRevocationService.isRevoked(token)) {

            try {
                UserDetails ud = jwtProvider.loadUserFromToken(token);
                var authentication = new UsernamePasswordAuthenticationToken(
                        ud, null, ud.getAuthorities());

                authentication.setDetails(
                        new WebAuthenticationDetailsSource().buildDetails(request)
                );
                SecurityContextHolder.getContext().setAuthentication(authentication);

                // ✅ request에 userId 저장
                String userIdStr = jwtProvider.parseClaims(token).getSubject();
                Long userId = Long.parseLong(userIdStr);
                request.setAttribute("userId", userId);

            } catch (UsernameNotFoundException ex) {
                Cookie empty = new Cookie("accessToken", null);
                empty.setPath("/"); empty.setMaxAge(0);
                response.addCookie(empty);
            }
        }

        chain.doFilter(request, response);
    }
}
