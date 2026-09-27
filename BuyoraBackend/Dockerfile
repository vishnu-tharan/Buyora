# Multi-stage build
FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /workspace

# Copy Maven files for layer caching
COPY pom.xml .
COPY .mvn .mvn
COPY mvnw .
RUN chmod +x mvnw

# Download dependencies (cached layer)
RUN ./mvnw dependency:go-offline -B --no-transfer-progress

# Build application
COPY src src
RUN ./mvnw clean package -DskipTests -B --no-transfer-progress

# Runtime stage
FROM eclipse-temurin:21-jre-alpine AS runtime

# Security: run as non-root
RUN addgroup -g 1001 buyora && adduser -u 1001 -G buyora -s /bin/sh -D buyora

WORKDIR /app

# Copy built jar
COPY --from=build /workspace/target/*.jar app.jar

RUN chown buyora:buyora app.jar
USER buyora

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD wget -q -O /dev/null http://localhost:8080/actuator/health || exit 1

EXPOSE 8080

ENTRYPOINT ["java", "-Djava.security.egd=file:/dev/./urandom", "-jar", "app.jar"]
