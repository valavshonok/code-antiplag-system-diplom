# Stage 1: Build frontend
FROM node:20 as frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Stage 2: Build backend with frontend
FROM maven:3.9.3-eclipse-temurin-20 as backend-builder
WORKDIR /app/backend
COPY backend/pom.xml .
COPY backend/src ./src
# Копируем фронтенд билд в static
COPY --from=frontend-builder /app/frontend/dist ./src/main/resources/static
RUN mvn clean package -DskipTests

# Stage 3: Run Spring Boot
FROM eclipse-temurin:20-jre-alpine
WORKDIR /app
COPY --from=backend-builder /app/backend/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java","-jar","app.jar"]
