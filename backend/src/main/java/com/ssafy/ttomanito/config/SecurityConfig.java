package com.ssafy.ttomanito.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityCustomizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import lombok.RequiredArgsConstructor;

import com.ssafy.ttomanito.global.security.oauth.SocialUserService;
import com.ssafy.ttomanito.global.security.filter.JwtAuthenticationFilter;
import com.ssafy.ttomanito.global.security.oauth.OAuth2AuthenticationSuccessHandler;

@Configuration
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {
    private final JwtAuthenticationFilter jwtFilter;
    private final OAuth2AuthenticationSuccessHandler successHandler;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http, SocialUserService socialUserService) throws Exception {
        http.csrf(AbstractHttpConfigurer::disable)
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers(
                                "/login",                // 커스텀 로그인 뷰
                                "/oauth2/authorization/**",  // 인가 요청 (ex: /oauth2/authorization/kakao)
                                "/login/oauth2/code/**",     // 기본 콜백 (ex: /login/oauth2/code/kakao)
                                "/auth/**"                   // /auth/refresh, /auth/logout
                        ).permitAll()
                        .anyRequest().authenticated()
                )
                .oauth2Login(oauth -> oauth
                        .loginPage("/login")
                        .userInfoEndpoint(u -> u.oidcUserService(socialUserService))
                        .successHandler(successHandler)
                )
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        http.logout(logout -> logout
                .logoutUrl("/auth/logout")                          // POST /auth/logout
                .logoutSuccessUrl("/login")                         // 로그아웃 후 /login 리다이렉트
                .deleteCookies("accessToken","refreshToken","JSESSIONID")
                .permitAll()
        );
        return http.build();
    }

    @Bean
    public WebSecurityCustomizer webCustomizer() {
        return web -> web.ignoring().requestMatchers(HttpMethod.OPTIONS, "/**");
    }
}