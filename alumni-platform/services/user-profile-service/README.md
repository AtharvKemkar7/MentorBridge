# User/Profile Service

Student and Alumni Profile management microservice for the Alumni-Student Platform.

## Features

- Student Profile Management (education, skills, career interests)
- Alumni Profile Management (education, skills, experience, expertise areas)
- Mentor search and discovery
- Profile completeness tracking
- Public/private profile visibility
- Alumni verification workflow

## Technology Stack

- Java 21
- Spring Boot 3.2+
- Spring Security 6
- Spring Data JPA / Hibernate
- PostgreSQL 16
- Redis (Caching)
- Apache Kafka (Event Publishing)
- Flyway (Database Migrations)
- Testcontainers (Integration Testing)

## API Endpoints

### Student Profile
- `POST /api/student/profile` - Create student profile
- `GET /api/student/profile` - Get own profile
- `PUT /api/student/profile` - Update own profile
- `GET /api/student/profile/{profileId}` - Get profile by ID (Admin/Alumni)

### Alumni Profile
- `POST /api/alumni/profile` - Create alumni profile
- `GET /api/alumni/profile` - Get own profile
- `PUT /api/alumni/profile` - Update own profile
- `GET /api/alumni/profile/{profileId}` - Get profile by ID (Admin/Student)
- `PUT /api/alumni/profile/{profileId}/verification` - Verify alumni (Admin)

### Education
- `POST /api/profile/education` - Add education
- `DELETE /api/profile/education/{educationId}` - Delete education

### Skills
- `POST /api/profile/skills` - Add skill
- `DELETE /api/profile/skills/{skillId}` - Delete skill

### Experience (Alumni only)
- `POST /api/alumni/profile/experience` - Add experience
- `DELETE /api/alumni/profile/experience/{experienceId}` - Delete experience

### Career Interests (Student only)
- `POST /api/student/profile/career-interests` - Add career interest
- `DELETE /api/student/profile/career-interests/{careerInterestId}` - Delete career interest

### Expertise Areas (Alumni only)
- `POST /api/alumni/profile/expertise` - Add expertise area
- `DELETE /api/alumni/profile/expertise/{expertiseAreaId}` - Delete expertise area

### Search
- `GET /api/search/mentors` - Search available mentors
- `GET /api/search/alumni` - Search alumni
- `GET /api/search/recommended-mentors` - Get recommended mentors for student

## Database Schema

- `student_profiles` - Student profile information
- `alumni_profiles` - Alumni profile information
- `educations` - Education records (both student and alumni)
- `skills` - Skills (both student and alumni)
- `experiences` - Work experiences (alumni only)
- `career_interests` - Career interests (student only)
- `expertise_areas` - Mentoring expertise areas (alumni only)

## Configuration

Key environment variables:
- `DB_USERNAME` / `DB_PASSWORD` - Database credentials
- `REDIS_HOST` / `REDIS_PORT` - Redis for caching
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

## Security

- JWT token validation via Identity Service
- Role-based access control (STUDENT, ALUMNI, ADMIN)
- Resource-level authorization
- Public profiles accessible without authentication (search endpoints)