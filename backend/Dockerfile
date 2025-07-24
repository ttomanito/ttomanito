# 빌드 단계
FROM gradle:7.6.0-jdk17 AS builder

WORKDIR /app
COPY . .

RUN gradle build --no-daemon

# 실행 단계 (경량 이미지)
FROM openjdk:17

WORKDIR /app
COPY --from=builder /app/build/libs/*.jar app.jar

ENTRYPOINT ["java", "-jar", "app.jar"]
