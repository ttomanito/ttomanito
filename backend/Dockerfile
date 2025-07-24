# backend/Dockerfile

###  Gradle 빌드 (빌드용 컨테이너)
FROM gradle:7.6.0-jdk17 AS builder

WORKDIR /app
COPY . .

# 의존성 캐시를 위해 먼저 복사
RUN gradle build --no-daemon

### 실행용 컨테이너 (경량)
FROM openjdk:17-jdk-slim

WORKDIR /app
COPY --from=builder /app/build/libs/*.jar app.jar

ENTRYPOINT ["java", "-jar", "app.jar"]
