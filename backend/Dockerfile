# Use a base image with Maven and JDK installed
FROM maven:3.9.6-eclipse-temurin-21 AS build

# Set the working directory in the container
WORKDIR /app

# Copy the Maven project files
COPY pom.xml .
COPY src ./src

# Build the Maven project, passing in the environment variable
RUN mvn clean package

# ✅ Use a full Debian-based OpenJDK image
FROM openjdk:21-jdk-slim

# ✅ Install essential networking and DNS debugging tools
RUN apt update && apt install -y dnsutils curl wget netcat-openbsd iputils-ping

# Set the working directory in the container
WORKDIR /app

# Expose the port that your Spring Boot application runs on
EXPOSE 8080

# Copy the built JAR file from the build stage
COPY --from=build /app/target/ConjugateIgbo-0.0.1-SNAPSHOT.jar /app/conjugateigbo.jar

# ✅ Use `ENTRYPOINT` to allow runtime environment variables
ENTRYPOINT ["sh", "-c", "java -Dspring.profiles.active=${SPRING_PROFILES_ACTIVE} -Dspring.data.mongodb.uri=${MONGODB_URI} -Dspring.data.mongodb.database=${MONGO_DB} -Dapp.api-key=${API_KEY} -jar /app/conjugateigbo.jar"]

