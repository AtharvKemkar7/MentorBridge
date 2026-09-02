# Identity Service

Authentication and Authorization microservice for the Alumni-Student Platform.

## Features

- User Registration (Student, Alumni, Admin)
- Login with JWT Access & Refresh Tokens
- Token Refresh with Rotation
- Password Management (Change, Reset)
- Account Status Management
- Role-Based Access Control (RBAC)
- Account Lockout after Failed Attempts
- Secure Password Hashing (BCrypt)

## Technology Stack

- Java 21
- Spring Boot 3.2+
- Spring Security 6
- Spring Data JPA / Hibernate
- PostgreSQL 16
- Redis (Token Blacklisting)
- Apache Kafka (Event Publishing)
- JWT (JJWT 0.12+)
- Flyway (Database Migrations)
- Testcontainers (Integration Testing)

## API Endpoints

### Public Endpoints
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token

### Protected Endpoints
- `POST /api/auth/logout` - Logout (revoke refresh token)
- `POST /api/auth/logout-all` - Logout from all devices
- `POST /api/auth/change-password` - Change password
- `GET /api/users/me` - Get current user profile
- `PATCH /api/users/me` - Update current user profile

### Admin Endpoints
- `GET /api/users/{userId}` - Get user by ID
- `PATCH /api/users/{userId}/status` - Update account status
- `DELETE /api/users/{userId}` - Soft delete user

## Database Schema

- `users` - User accounts
- `roles` - User roles (STUDENT, ALUMNI, ADMIN)
- `permissions` - Granular permissions
- `role_permissions` - Role-Permission mapping
- `refresh_tokens` - Refresh token storage

## Configuration

Key environment variables:
- `DB_USERNAME` / `DB_PASSWORD` - Database credentials
- `JWT_SECRET` - Base64 encoded secret key (min 256 bits)
- `REDIS_HOST` / `REDIS_PORT` - Redis for token blacklisting
- `KAFKA_BOOTSTRAP_SERVERS` - Kafka for event publishing

## Running Locally

### With Docker Compose
```bash
docker-compose up -d
```

### With Maven
```bash
./mvnw spring-boot:run
```

## Running Tests

```bash
./mvnw test
```

## Building Docker Image

```bash
./mvnw clean package -Pdocker jib:dockerBuild
```

## Health Checks

- Liveness: `GET /actuator/health/liveness`
- Readiness: `GET /actuator/health/readiness`
- Full Health: `GET /actuator/health`

## Metrics

Prometheus metrics available at: `GET /actuator/prometheus`

## Security Notes

- All passwords hashed with BCrypt (cost factor 12)
- JWT tokens signed with HS256
- Access tokens: 15 minutes expiry
- Refresh tokens: 7 days expiry, rotated on use
- Max 5 concurrent refresh tokens per user
- Account locked after 5 failed login attempts (15 min)
- Tokens blacklisted on logout/password change