package com.ssafy.ttomanito.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.Resource;

import java.io.IOException;
import java.io.InputStream;

@Configuration
@ConditionalOnProperty(prefix = "fcm", name = "enabled", havingValue = "true")
public class FcmConfig {

    @Value("${fcm.credentials.location:}")
    private Resource credentials;

    @PostConstruct
    public void init() throws IOException {
        GoogleCredentials creds;

        if (credentials != null && credentials.exists() && credentials.isReadable()) {
            try (InputStream in = credentials.getInputStream()) {
                creds = GoogleCredentials.fromStream(in);
            }
        } else {
            // 배포에서 GOOGLE_APPLICATION_CREDENTIALS 등 ADC 경로 사용
            creds = GoogleCredentials.getApplicationDefault();
        }

        FirebaseOptions options = FirebaseOptions.builder()
                .setCredentials(creds)
                .build();

        if (FirebaseApp.getApps().isEmpty()) {
            FirebaseApp.initializeApp(options);
        }
    }
}
