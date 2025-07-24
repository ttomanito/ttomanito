# --------- 빌드 단계 ---------
FROM gradle:7.6.0-jdk17 AS builder

# gradle 유저가 작업할 수 있는 안전한 디렉토리로 설정
USER gradle
WORKDIR /home/gradle/app

# 소스 코드 복사 및 권한 부여
COPY --chown=gradle:gradle . .

# gradle 빌드 실행 (캐시 디렉토리도 안전한 위치로 지정)
RUN gradle build -x test --no-daemon -g /home/gradle/.gradle


# --------- 실행 단계 ---------
FROM openjdk:17
WORKDIR /app

# 빌드된 JAR 파일만 복사
COPY --from=builder /home/gradle/app/build/libs/*.jar app.jar

# 실행 명령
ENTRYPOINT ["java", "-jar", "app.jar"]
