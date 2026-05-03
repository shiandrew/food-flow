FROM --platform=linux/amd64 eclipse-temurin:21-jdk AS builder

WORKDIR /app

COPY gradlew gradlew.bat build.gradle settings.gradle ./
COPY gradle gradle
COPY src src

RUN chmod +x gradlew
RUN ./gradlew bootJar --no-daemon

FROM --platform=linux/amd64 eclipse-temurin:21-jre

WORKDIR /app

COPY --from=builder /app/build/libs/OnlineOrder-0.0.1-SNAPSHOT.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
