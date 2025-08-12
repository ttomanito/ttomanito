package com.ssafy.ttomanito.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import jakarta.annotation.PostConstruct;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;

import java.io.IOException;

@Configuration
public class FcmConfig {
    @PostConstruct
    public void init() throws IOException {
        var serviceAccount = new ClassPathResource("firebase-service-account.json").getInputStream();
        var options = FirebaseOptions.builder()
                .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                .build();
        if (FirebaseApp.getApps().isEmpty()) FirebaseApp.initializeApp(options);
    }
}
