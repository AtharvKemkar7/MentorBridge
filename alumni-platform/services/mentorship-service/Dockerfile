FROM maven:3.9.6-eclipse-temurin-21-alpine AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests -Pdocker

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
RUN addgroup -g 1000 -S appgroup && adduser -u 1000 -S appuser -G appgroup
COPY --from=build /app/target/mentorship-service-*.jar app.jar
RUN chown -R appuser:appgroup /app
USER appuser
EXPOSE 8084
ENV JAVA_OPTS="-Xms512m -Xmx1024m -XX:+UseG1GC -XX:+UseContainerSupport"
ENTRYPOINT ["sh","-c","java $JAVA_OPTS -jar app.jar"]