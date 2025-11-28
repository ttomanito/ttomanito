package com.ssafy.ttomanito.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebMvcConfig implements WebMvcConfigurer {
    /* CORS 설정 추가*/
    @Override
    public void addCorsMappings(CorsRegistry registry) {

            // React CORS 설정
            registry.addMapping("/**")  // 모든 경로에 대해 CORS 적용
                    .allowedOrigins("http://localhost:5173")
                    .allowedMethods("GET", "POST", "PUT","PATCH", "DELETE","OPTIONS", "HEAD" ) // 허용할 HTTP 메서드 설정
                    .allowedHeaders("*")  // 모든 헤더를 허용
                    .exposedHeaders("Authorization")
                    .allowCredentials(true);    // 자격 증명 허용 여부 설정

    }
}
