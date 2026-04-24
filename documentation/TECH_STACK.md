# Tech Stack

This document summarizes the technologies used in this project and how they fit together, including deployment on an Azure VM with Docker Compose.

## Overview

- **Backend style:** Monolithic REST API with clean architecture layers
- **Runtime:** Node.js
- **Language:** TypeScript
- **Framework:** NestJS
- **Database:** PostgreSQL
- **ORM:** TypeORM
- **Container platform:** Docker + Docker Compose
- **Deployment target:** Azure Virtual Machine (Ubuntu) running Docker Compose

## Backend and API

| Area | Technology | Notes |
|---|---|---|
| Framework | `@nestjs/core` + `@nestjs/common` (v10) | Main web framework and DI container |
| HTTP platform | `@nestjs/platform-express` | Express-based NestJS runtime |
| API docs | `@nestjs/swagger` + `swagger-ui-express` | Swagger UI exposed at `/docs` |
| Validation | `class-validator` + `class-transformer` | DTO validation and transformation |
| Reactive utilities | `rxjs` | Used by NestJS internals and optional app flows |

## Data and persistence

| Area | Technology | Notes |
|---|---|---|
| ORM | `typeorm` (0.3.x) | Repositories, entities, migrations |
| Nest integration | `@nestjs/typeorm` | TypeORM module wiring |
| Database driver | `pg` | PostgreSQL client driver |
| Database | PostgreSQL 15 (`postgres:15-alpine`) | Used in local and VM compose stacks |
| Migrations | TypeORM migrations | `migrationsRun: true` in app DB config |

Data model highlights:

- Core entities: `users`, `roles`, `permissions`
- Join tables: `user_roles`, `role_permissions`
- UUID primary keys with `uuid-ossp`
- Unique business keys (`users.email`, `roles.name`, `permissions.symbol`)

See `documentation/DATA_MODELING.md` for the schema-focused overview.

## Configuration and environment

- **Configuration module:** `@nestjs/config`
- **Env loading:** `dotenv`
- **Important env vars:** `DB_*`, `PORT`, `CORS_ORIGIN`, `AUTH_TOKEN`, `AUTH_READ_TOKEN`, `IMAGE_NAME`, `IMAGE_TAG`
- Example file: `.env.example`

## Build, quality, and testing

| Area | Technology | Notes |
|---|---|---|
| Build | Nest CLI + TypeScript | `npm run build` |
| Linting | ESLint + `@typescript-eslint/*` | `npm run lint` |
| Formatting | Prettier | `npm run format` |
| Unit/Integration tests | Jest + `ts-jest` | `npm test`, `npm run test:integration` |
| HTTP testing | Supertest | Integration and API-level tests |

## Containerization

- **Dockerfile:** Multi-stage build using `node:18-alpine` (builder + production image)
- **Local compose file:** `docker-compose.yml`
  - Builds API image locally
  - Runs API + PostgreSQL in one network
- **VM compose file:** `docker-compose.vm.yml`
  - Pulls API image from Docker Hub using `IMAGE_NAME` + `IMAGE_TAG`
  - Runs API + PostgreSQL on the VM

Health checks are configured for both PostgreSQL and the API service.

## Deployment model (Azure VM + Docker Compose)

Deployment is designed around a single Azure VM:

1. Build and publish the API image to Docker Hub.
2. SSH into Azure VM.
3. Pull image and start services with `docker-compose.vm.yml`.
4. API container runs on port `3000` internally and is exposed as `80:3000` in VM compose.
5. PostgreSQL runs as a sidecar container with a persistent Docker volume.

Related docs:

- `documentation/DEPLOYMENT.md`
- `docker-compose.vm.yml`

## Notes on infrastructure automation

The project documentation references Terraform and GitHub Actions for infra provisioning and CI/CD in Azure. In the current workspace snapshot, deployment behavior is clearly documented in `README.md` and `documentation/DEPLOYMENT.md`; workflow files may exist in another branch or repository state.

