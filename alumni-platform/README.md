# Alumni–Student Career & Mentorship Platform

Single-institute platform connecting students with verified alumni for career guidance and mentorship.

## Architecture Overview

- **7 Microservices** with database-per-service pattern
- **Event-driven** asynchronous communication via message broker
- **REST APIs** for synchronous operations
- **API Gateway** for external traffic routing
- **Angular** frontend with feature-based architecture
- **PostgreSQL** per service
- **Docker + Kubernetes** deployment

## Services

| Service | Port | Database | Responsibility |
|---------|------|----------|----------------|
| Identity Service | 8081 | identity_db | Authentication, authorization, tokens |
| User/Profile Service | 8082 | profile_db | Student/alumni profiles, skills, education |
| Institution Service | 8083 | institution_db | Institute config, alumni verification, admin ops |
| Mentorship Service | 8084 | mentorship_db | Mentor discovery, requests, relationships |
| Scheduling Service | 8085 | scheduling_db | Availability, bookings, sessions |
| Review Service | 8086 | review_db | Reviews, ratings, moderation |
| Notification Service | 8087 | notification_db | In-app, email notifications |
| API Gateway | 8080 | — | Routing, auth integration, rate limiting |

## Documentation

- [Architecture](docs/ARCHITECTURE.md) — Service boundaries, communication, data ownership
- [Database Design](docs/DATABASE.md) — Per-service schemas, indexes, constraints
- [Security](docs/SECURITY.md) — Auth, authz, threat model, mitigations
- [API Contracts](docs/API.md) — Conventions, versioning, error format
- [Development](docs/DEVELOPMENT.md) — Frontend structure, coding standards
- [Deployment](docs/DEPLOYMENT.md) — Docker, K8s, CI/CD, Terraform
- [Observability](docs/OBSERVABILITY.md) — Logging, metrics, tracing, health
- [Testing](docs/TESTING.md) — Unit, integration, API, security, contract, E2E
- [Implementation Roadmap](docs/IMPLEMENTATION_ROADMAP.md) — Phased delivery plan

## Quick Start

```bash
# Infrastructure
cd infra/docker && docker-compose up -d

# Services (each service has its own docker-compose.yml)
cd services/identity-service && docker-compose up -d
# ... repeat for each service

# Frontend
cd frontend && npm install && npm start
```

## Repository Structure

```
alumni-platform/
├── docs/                    # Architecture & design documents
├── infra/                   # Infrastructure as Code
│   ├── docker/             # Docker Compose for local dev
│   ├── kubernetes/         # K8s manifests (Helm/Kustomize)
│   ├── terraform/          # Cloud infrastructure
│   └── ci-cd/              # Pipeline definitions
├── services/               # Backend microservices (Spring Boot)
│   ├── identity-service/
│   ├── user-profile-service/
│   ├── institution-service/
│   ├── mentorship-service/
│   ├── scheduling-service/
│   ├── review-service/
│   ├── notification-service/
│   └── api-gateway/
├── frontend/               # Angular application
│   ├── src/app/
│   │   ├── auth/           # Login, registration, guards
│   │   ├── student/        # Student dashboard & features
│   │   ├── alumni/         # Alumni dashboard & features
│   │   ├── mentorship/     # Discovery, requests
│   │   ├── booking/        # Scheduling, sessions
│   │   ├── reviews/        # Reviews & ratings
│   │   ├── notifications/  # In-app notifications
│   │   ├── admin/          # Admin panel
│   │   ├── shared/         # Shared components, pipes, directives
│   │   └── core/           # Core services, interceptors, guards
│   └── e2e/                # Cypress/Playwright tests
├── shared-libs/            # Shared TypeScript/Java libraries (minimal)
└── scripts/                # Operational scripts
```

## Technology Stack

- **Backend**: Java 21, Spring Boot 3.2+, Spring Security, Spring Data JPA, Hibernate, Maven
- **Frontend**: Angular 18+, TypeScript, RxJS, Angular Material/Tailwind
- **Database**: PostgreSQL 16 per service
- **Messaging**: Apache Kafka (event streaming)
- **Gateway**: Spring Cloud Gateway
- **Observability**: OpenTelemetry, Prometheus, Grafana, Loki, Tempo
- **CI/CD**: GitHub Actions / GitLab CI
- **Deployment**: Docker, Kubernetes (Helm), Terraform

## Security Principles

- Zero-trust service-to-service communication (mTLS)
- JWT access tokens + refresh token rotation
- RBAC + resource-level authorization (ABAC)
- Rate limiting, secure headers, audit logging
- Secrets via Vault/Sealed Secrets — never in repo

## License

Proprietary — Institute Internal Use Only