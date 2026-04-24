# NestJS Clean Architecture API

This project is a REST API built with NestJS and TypeScript, designed around Clean Architecture.
It provides user, role, and permission management with PostgreSQL persistence and Docker-based deployment.

## Project Overview

- **What it is:** A backend service for user and role administration.
- **How it works:** HTTP controllers handle requests, call application use cases, and use domain contracts that are implemented by infrastructure repositories.
- **Why this structure:** Business logic stays independent from frameworks and database concerns.

### Request flow (high level)

`Controller (presentation) -> Use case (application) -> Domain entities/contracts -> Repository implementation (infrastructure) -> PostgreSQL`

## Project Structure

```text
src/
  app.module.ts                # Application composition root
  main.ts                      # Bootstrap, middleware, global pipes, Swagger
  domain/                      # Entities and repository interfaces
  application/                 # Use cases
  infrastructure/              # TypeORM entities + repository implementations
  presentation/                # Controllers, DTOs, response mappers
  modules/                     # Nest modules and dependency wiring
  shared/                      # Auth middleware/guards, exceptions, filters
```

## Quick Start

### 1) Local run

```bash
npm install
cp .env.example .env
npm run start:dev
```

- API base: `http://localhost:3000`
- Swagger: `http://localhost:3000/docs`

### 2) Docker Compose (local)

```bash
cp .env.example .env
docker-compose up -d
docker-compose logs -f
```

This starts both `nestjs` and `postgres` from `docker-compose.yml`.

### 3) VM mode (Azure host)

```bash
docker-compose -f docker-compose.vm.yml pull
docker-compose -f docker-compose.vm.yml up -d
```

In VM mode, the app image is pulled from Docker Hub using `IMAGE_NAME` and `IMAGE_TAG`.

## Key Scripts

```bash
npm run build
npm test
npm run test:integration
npm run migration:run
```

## Documentation

- `documentation/AUTHENTICATION.md`: brief overview of the token-based auth and permission checks.
- `documentation/CLEAN_ARCHITECTURE.md`: layer responsibilities, dependency rules, and boundary checks.
- `documentation/TECH_STACK.md`: technologies used and deployment stack.
- `documentation/DATA_MODELING.md`: entity model, relationships, and constraints.
