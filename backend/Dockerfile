# ---- Build stage ----
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn -q -DskipTests package

# ---- Run stage ----
FROM eclipse-temurin:21-jre
WORKDIR /app

# Sensible JVM defaults for containers
ENV JAVA_OPTS="-XX:MaxRAMPercentage=75.0 -Dfile.encoding=UTF-8"

# Spring will bind to Railway's PORT at runtime; default 8080 locally
ENV PORT=8080
EXPOSE 8080

COPY --from=build /app/target/*-SNAPSHOT.jar /app/app.jar

# Let env decide the active profile; don't hardcode DB props here
ENTRYPOINT ["sh","-c","java $JAVA_OPTS -jar /app/app.jar --spring.profiles.active=${SPRING_PROFILES_ACTIVE:-dev}"]
