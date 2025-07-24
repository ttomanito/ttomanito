# 빌드용 이미지
FROM gradle:7.6.0-jdk17 AS builder

WORKDIR /app

COPY --chown=gradle:gradle . .

USER gradle

RUN gradle build -x test --no-daemon -g /tmp/.gradle

# 실행용 이미지
FROM openjdk:17

WORKDIR /app

COPY --from=builder /app/build/libs/*.jar app.jar

ENTRYPOINT ["java", "-jar", "app.jar"]
