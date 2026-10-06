FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /workspace
COPY pom.xml mvnw ./
COPY .mvn .mvn
RUN sed -i 's/\r$//' mvnw && chmod +x mvnw
RUN ./mvnw dependency:go-offline -B --no-transfer-progress
COPY src src
# Unit tests run during package. Database integration tests run with mvnw verify.
RUN ./mvnw clean package -B --no-transfer-progress
FROM eclipse-temurin:21-jre-alpine AS runtime
RUN addgroup -S -g 1001 buyora && adduser -S -u 1001 -G buyora buyora
WORKDIR /app
COPY --from=build --chown=buyora:buyora /workspace/target/buyora-api-1.0.0-SNAPSHOT.jar app.jar
USER buyora
EXPOSE 8080
ENTRYPOINT ["java", "-Djava.security.egd=file:/dev/./urandom", "-jar", "app.jar"]
