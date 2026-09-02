# Architecture Document

## System Overview

The Alumni–Student Career & Mentorship Platform is a microservices-based system designed to connect students with verified alumni for career guidance and mentorship within a single institute.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              EXTERNAL CLIENTS                                │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │   Web App   │  │ Mobile App  │  │  Admin UI   │  │   Third-party       │ │
│  │  (Angular)  │  │  (Future)   │  │  (Angular)  │  │   Integrations      │ │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └─────────┬───────────┘ │
└─────────┼────────────────┼────────────────┼────────────────────┼─────────────┘
          │                │                │                    │
          ▼                ▼                ▼                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                            API GATEWAY (Port 8080)                          │
│                    Spring Cloud Gateway + Spring Security                   │
│              Routing │ Auth Validation │ Rate Limiting │ Logging           │
└─────────────────────────────────┬───────────────────────────────────────────┘
                                  │
        ┌─────────────────────────┼─────────────────────────┐
        ▼                         ▼                         ▼
┌───────────────┐         ┌───────────────┐         ┌───────────────┐
│  Identity     │         │  User Profile │         │  Institution  │
│  Service      │         │  Service      │         │  Service      │
│  (8081)       │         │  (8082)       │         │  (8083)       │
│               │         │               │         │               │
│ • Auth/Reg    │         │ • Profiles    │         │ • Inst Config │
│ • JWT Tokens  │         │ • Skills      │         │ • Verification│
│ • RBAC/ABAC   │         │ • Education   │         │ • Admin Ops   │
│ • Permissions │         │ • Experience  │         │               │
└───────┬───────┘         └───────┬───────┘         └───────┬───────┘
        │                         │                         │
        ▼                         ▼                         ▼
┌───────────────┐         ┌───────────────┐         ┌───────────────┐
│ identity_db   │         │  profile_db   │         │institution_db │
│ (PostgreSQL)  │         │  (PostgreSQL) │         │ (PostgreSQL)  │
└───────────────┘         └───────────────┘         └───────────────┘
        │                         │                         │
        └─────────────────────────┼─────────────────────────┘
                                  │
                    ┌─────────────┴─────────────┐
                    ▼                           ▼
            ┌───────────────┐           ┌───────────────┐
            │   Mentorship  │           │    Booking    │
            │   Service     │           │   Service     │
            │   (8084)      │           │   (8085)      │
            │               │           │               │
            │ • Discovery   │           │ • Availability│
            │ • Requests    │           │ • Slots       │
            │ • Relationships│          │ • Bookings    │
            │ • Categories  │           │ • Sessions    │
            └───────┬───────┘           └───────┬───────┘
                    │                           │
                    ▼                           ▼
            ┌───────────────┐           ┌───────────────┐
            │mentorship_db  │           │ scheduling_db │
            │(PostgreSQL)   │           │(PostgreSQL)   │
            └───────────────┘           └───────────────┘
                    │                           │
                    └─────────────┬─────────────┘
                                  │
                    ┌─────────────┴─────────────┐
                    ▼                           ▼
            ┌───────────────┐           ┌───────────────┐
            │   Review      │           │ Notification  │
            │   Service     │           │   Service     │
            │   (8086)      │           │   (8087)      │
            │               │           │               │
            │ • Reviews     │           │ • In-app      │
            │ • Ratings     │           │ • Email       │
            │ • Moderation  │           │ • Preferences │
            └───────┬───────┘           └───────┬───────┘
                    │                           │
                    ▼                           ▼
            ┌───────────────┐           ┌───────────────┐
            │  review_db    │           │notification_db│
            │ (PostgreSQL)  │           │ (PostgreSQL)  │
            └───────────────┘           └───────────────┘
```

## Service Boundaries & Responsibilities

### 1. Identity Service (Port 8081)
**Database:** `identity_db`

**Responsibilities:**
- User registration & authentication (email/password, OAuth2)
- JWT access/refresh token management with rotation
- Role-based access control (RBAC): STUDENT, ALUMNI, ADMIN, MENTOR
- Permission management for fine-grained authorization (ABAC)
- Account verification, suspension, password reset
- Session management & token blacklisting (Redis)

**Key Entities:** User, Role, Permission, RefreshToken

**Events Published:** `UserRegisteredEvent`, `PasswordChangedEvent`

---

### 2. User Profile Service (Port 8082)
**Database:** `profile_db`

**Responsibilities:**
- Student profile management (skills, education, career interests)
- Alumni profile management (expertise areas, experience, verification status)
- Profile search & discovery with filters
- Skill & expertise area catalog management

**Key Entities:** StudentProfile, AlumniProfile, Skill, ExpertiseArea, Education, Experience, CareerInterest

**Events Consumed:** `UserRegisteredEvent` (creates initial profile)

---

### 3. Institution Service (Port 8083) — **NOT IMPLEMENTED**
**Database:** `institution_db`

**Responsibilities:**
- Institute configuration (departments, programs, graduation years)
- Alumni verification workflow (admin approval, document validation)
- Administrative operations (user management, analytics, reports)
- Institute-level settings & branding

**Key Entities:** Institute, Department, Program, VerificationRequest, AdminSettings

---

### 4. Mentorship Service (Port 8084)
**Database:** `mentorship_db`

**Responsibilities:**
- Mentor discovery with filters (skills, industry, availability)
- Mentorship request lifecycle (create, accept, reject, cancel)
- Active mentorship relationship management
- Mentorship category/interest management

**Key Entities:** Mentorship, MentorshipRequest, MentorshipCategory

**Events Published:** `MentorshipRequestedEvent`, `MentorshipAcceptedEvent`, `MentorshipCompletedEvent`

**Events Consumed:** `UserRegisteredEvent` (for profile sync)

---

### 5. Booking/Scheduling Service (Port 8085)
**Database:** `scheduling_db`

**Responsibilities:**
- Alumni availability management (recurring & one-time)
- Time slot generation & conflict detection
- Booking lifecycle (create, confirm, cancel, reschedule)
- Session management (meeting links, notes, recordings)

**Key Entities:** Availability, Slot, Booking, Session

**Events Published:** `BookingCreatedEvent`, `BookingConfirmedEvent`, `SessionCompletedEvent`

**Events Consumed:** `MentorshipAcceptedEvent` (enables booking for matched pairs)

---

### 6. Review Service (Port 8086) — **NOT IMPLEMENTED**
**Database:** `review_db`

**Responsibilities:**
- Post-session reviews & ratings (1-5 stars + comments)
- Review moderation (flagging, admin review, publication)
- Aggregate ratings for mentor profiles
- Review response from reviewee

**Key Entities:** Review, Rating, ModerationQueue

**Events Consumed:** `SessionCompletedEvent` (triggers review prompt)

---

### 7. Notification Service (Port 8087) — **NOT IMPLEMENTED**
**Database:** `notification_db`

**Responsibilities:**
- In-app notification center (real-time via WebSocket/SSE)
- Email notifications (SMTP, templates, scheduling)
- Notification preferences per user & channel
- Notification history & read status

**Key Entities:** Notification, NotificationPreference, EmailTemplate

**Events Consumed:** All domain events (UserRegistered, MentorshipRequested, BookingCreated, SessionCompleted, ReviewPublished, etc.)

---

### 8. API Gateway (Port 8080) — **NOT IMPLEMENTED**
**No Database**

**Responsibilities:**
- Request routing to backend services
- JWT validation & user context propagation
- Rate limiting (per IP, per user, per endpoint)
- Request/response logging & correlation IDs
- CORS handling, SSL termination
- Circuit breaker & fallback responses

---

## Data Ownership & Communication Patterns

### Database-per-Service Pattern
Each service owns its database exclusively. No direct database access across services.

### Synchronous Communication (REST)
- API Gateway → Services (all external traffic)
- Service-to-service for query operations requiring immediate consistency
- OpenAPI/Swagger contracts for all endpoints

### Asynchronous Communication (Kafka Events)
- Domain events for state changes that other services need
- Event schema versioning with Avro/Protobuf
- At-least-once delivery with idempotent consumers

**Key Topics:**
| Topic | Producers | Consumers |
|-------|-----------|-----------|
| `user.registered` | Identity | Profile, Notification |
| `user.password.changed` | Identity | Notification |
| `mentorship.requested` | Mentorship | Notification |
| `mentorship.accepted` | Mentorship | Booking, Notification |
| `mentorship.completed` | Mentorship | Review, Notification |
| `booking.created` | Booking | Notification |
| `booking.confirmed` | Booking | Notification |
| `session.completed` | Booking | Review, Notification |
| `review.published` | Review | Notification, Profile (aggregate rating) |

---

## Security Architecture

### Authentication Flow
```
1. Client → API Gateway: POST /auth/login (credentials)
2. API Gateway → Identity Service: Validate credentials
3. Identity Service: Generate JWT access token (15min) + refresh token (7d)
4. Identity Service → Redis: Store refresh token hash
5. Response: Access token (header) + Refresh token (HttpOnly cookie)
```

### Authorization
- **Gateway Level:** JWT validation, token expiry, blacklist check
- **Service Level:** Spring Security method security with `@PreAuthorize`
- **Resource Level:** ABAC policies evaluating user attributes + resource ownership

### Service-to-Service
- mTLS for all inter-service communication
- Service identity via X.509 certificates (Istio/cert-manager)
- JWT bearer tokens for API Gateway → Service calls

---

## Infrastructure

### Local Development (docker-compose)
```
infra/docker/docker-compose.yml:
  - postgresql (shared instance, separate databases per service)
  - kafka + zookeeper
  - redis (token blacklist, caching)
  - mailhog (email testing)
  - prometheus + grafana + loki + tempo (observability)
```

### Kubernetes Deployment (Helm)
```
infra/kubernetes/
  ├── base/              # Common K8s resources
  ├── overlays/
  │   ├── dev/
  │   ├── staging/
  │   └── prod/
  └── charts/            # Helm charts per service
```

### CI/CD Pipeline
```
infra/ci-cd/
  ├── github-actions/    # or gitlab-ci/
  │   ├── build.yml      # Build, test, scan, dockerize
  │   ├── deploy-dev.yml # Auto-deploy to dev on merge
  │   ├── deploy-staging.yml
  │   └── deploy-prod.yml # Manual approval
```

---

## Observability

### Metrics (Prometheus)
- RED metrics per service (Rate, Errors, Duration)
- Business metrics (active mentorships, booking conversion, etc.)
- JVM metrics (GC, heap, threads)

### Logging (Loki)
- Structured JSON logs with correlation IDs
- Log levels: ERROR, WARN, INFO, DEBUG
- Centralized via Grafana Loki

### Tracing (Tempo)
- OpenTelemetry instrumentation
- W3C TraceContext propagation
- Service graph visualization

### Health Checks
- `/actuator/health` per service (liveness + readiness)
- Database, Kafka, Redis, downstream service dependencies

---

## Technology Stack Summary

| Layer | Technology |
|-------|------------|
| Language | Java 21 |
| Framework | Spring Boot 3.2+ |
| Security | Spring Security 6, JWT (jjwt 0.12.5) |
| Data | Spring Data JPA, Hibernate, Flyway |
| Database | PostgreSQL 16 (per service) |
| Messaging | Apache Kafka (Spring Kafka) |
| Caching | Redis (Spring Data Redis) |
| Gateway | Spring Cloud Gateway |
| Build | Maven |
| Container | Docker, Jib |
| Orchestration | Kubernetes, Helm |
| IaC | Terraform |
| Observability | OpenTelemetry, Prometheus, Grafana, Loki, Tempo |
| Frontend | Angular 18+, TypeScript, RxJS |
| Testing | JUnit 5, Testcontainers, Mockito, AssertJ |

---

## Implementation Status

| Service | Status | Port | Database |
|---------|--------|------|----------|
| api-gateway | ❌ Not Started | 8080 | — |
| identity-service | ✅ Complete | 8081 | identity_db |
| user-profile-service | ✅ Complete | 8082 | profile_db |
| institution-service | ❌ Not Started | 8083 | institution_db |
| mentorship-service | ✅ Complete | 8084 | mentorship_db |
| booking-service | ✅ Complete | 8085 | scheduling_db |
| review-service | ❌ Not Started | 8086 | review_db |
| notification-service | ❌ Not Started | 8087 | notification_db |

---

## Next Steps

1. **Implement API Gateway** - Routing, auth, rate limiting
2. **Implement Institution Service** - Verification, admin ops
3. **Implement Review Service** - Ratings, moderation
4. **Implement Notification Service** - In-app, email
5. **Create infra/docker/docker-compose.yml** - Local dev stack
6. **Build Angular Frontend** - Feature modules per service
7. **Add remaining documentation** - API contracts, security, deployment