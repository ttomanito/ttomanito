FROM gradle:8.4.0-jdk17 AS builder
WORKDIR /app
COPY . /app
RUN gradle clean build -x test

# 2. 실행용 Stage
FROM eclipse-temurin:17-jdk
WORKDIR /app
COPY --from=builder /app/build/libs/ttomanito-1.0.0.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
