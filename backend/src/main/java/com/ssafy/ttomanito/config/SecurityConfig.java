package com.ssafy.ttomanito.config;

import com.ssafy.ttomanito.global.security.filter.JwtAuthenticationFilter;
import com.ssafy.ttomanito.global.security.oauth.OAuth2AuthenticationSuccessHandler;
import com.ssafy.ttomanito.global.security.oauth.SocialUserService;
import com.ssafy.ttomanito.global.security.utils.CookieUtils;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseCookie;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityCustomizer;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.stream.Stream;

@Slf4j
@Configuration
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    @Value("${url.redirect.base}")
    private String frontendRedirectUrl;

    private final JwtAuthenticationFilter jwtFilter;
    private final OAuth2AuthenticationSuccessHandler successHandler;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http, SocialUserService socialUserService) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(AbstractHttpConfigurer::disable)
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers(
                                "/index.html",
                                "/static/**", "/*.png", "/*.json", "/*.ico"
                        ).permitAll()
                        .requestMatchers(
                                "/v3/api-docs/**",
                                "/api/v3/api-docs/**",
                                "/swagger-ui/**",
                                "/api/swagger-ui/**",
                                "/swagger-ui.html",
                                "/api/swagger-ui/index.html**"
                        ).permitAll()
                        .requestMatchers(
                                "/auth/**",
                                "/login",
                                "/oauth2/authorization/**",
                                "/login/oauth2/code/**"
                        ).permitAll()
                        .requestMatchers("/ws/**", "/ws/signal/**", "/topic/**", "/app/**").permitAll()
                        .requestMatchers("/chat/**").authenticated()
                        .anyRequest().authenticated()
                )
                .oauth2Login(oauth -> oauth
                        .loginPage("/login")
                        .userInfoEndpoint(u -> u.oidcUserService(socialUserService))
                        .successHandler(successHandler)
                        .failureHandler((req, res, ex) -> {
                            log.error("OAuth2 fail", ex);
                            res.sendRedirect(frontendRedirectUrl + "/login?error=" + URLEncoder.encode(ex.getMessage(), StandardCharsets.UTF_8));
                        })
                )
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class)
                .logout(logout -> logout
                        .logoutUrl("/auth/logout")
                        .addLogoutHandler((req, res, auth) -> {
                            Stream.of("accessToken","refreshToken","JSESSIONID","kakaoAccessToken")
                                    .forEach(n -> CookieUtils.deleteCookie(req, res, n));
                        })
                        .logoutSuccessHandler((req, res, auth) -> res.setStatus(204))
                )
                .exceptionHandling(e -> e.authenticationEntryPoint((req, res, ex) -> res.sendError(401)));

        return http.build();
    }


    @Bean
    public WebSecurityCustomizer webCustomizer() {
        return web -> web.ignoring().requestMatchers(HttpMethod.OPTIONS, "/**");

    }

    //  CORS 설정 Bean 추가
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of(
                "http://localhost:5173",
                "https://i13b206.p.ssafy.io"
        ));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH","DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setExposedHeaders(List.of("Authorization"));
        config.setAllowCredentials(true); // 프론트에서 쿠키/토큰 등 전송 가능하게

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
