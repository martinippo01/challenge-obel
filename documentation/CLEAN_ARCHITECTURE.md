# Project Architecture (Clean Architecture)

This project follows a Clean Architecture style adapted to NestJS modules.

## Goals

- Keep business rules independent from frameworks and transport concerns.
- Depend on abstractions (`interfaces`) from inner layers.
- Isolate persistence and HTTP details in outer layers.

## Layer map in this codebase

| Layer | Path | Responsibility |
|---|---|---|
| Domain | `src/domain` | Entities and repository contracts (business core) |
| Application | `src/application` | Use cases orchestrating domain rules |
| Infrastructure | `src/infrastructure` | TypeORM entities and repository implementations |
| Presentation | `src/presentation` | Controllers, DTOs, HTTP mapping |
| Composition | `src/modules`, `src/app.module.ts` | Dependency wiring, module assembly, middleware |

## Dependency direction

Expected direction (outside to inside):

`presentation -> application -> domain`

`infrastructure -> domain`

`modules/app -> presentation + application + infrastructure`

### Allowed dependencies

- `domain`: no dependency on application, infrastructure, or presentation.
- `application`: depends on `domain` contracts/entities and shared domain-level exceptions.
- `infrastructure`: implements `domain` repository interfaces.
- `presentation`: calls `application` use cases, maps request/response DTOs.
- `modules`: performs dependency injection and composition.

### Not allowed (architecture rule)

- `domain` importing NestJS, TypeORM, controllers, or repositories implementations.
- `application` importing infrastructure repositories/entities directly.
- `presentation` importing infrastructure persistence directly.

## How this is implemented here

- **Domain contracts:** repository interfaces in `src/domain/repositories/*.interface.ts`.
- **Use cases:** classes in `src/application/use-cases/**` receive repository interfaces in constructors.
- **Infrastructure adapters:** implementations such as `src/infrastructure/persistence/repositories/user.repository.impl.ts` implement `IUserRepository`.
- **HTTP adapters:** controllers such as `src/presentation/controllers/user.controller.ts` invoke use cases and map to DTOs.
- **Composition root:** `src/modules/user.module.ts` and `src/modules/role.module.ts` bind tokens like `USER_REPOSITORY` and `ROLE_REPOSITORY` to concrete implementations.

## Codebase verification snapshot

Checked against current codebase structure and imports.

- `domain` has no NestJS/import leaks to outer layers.
- `application` does not import `@infrastructure/*` or `@presentation/*`.
- `presentation` imports `@application/*` use cases and does not import persistence repositories.
- `infrastructure` imports domain entities/contracts and TypeORM/Nest adapters.
- Module wiring in `src/modules/*.module.ts` follows dependency inversion via tokens.

## Observation from current code

- `src/application/use-cases/user/create-user.use-case.ts` imports `Injectable` from `@nestjs/common` but does not use it.
  - This does not break runtime behavior, but it is a framework leak in the application layer and can be removed to keep use cases framework-agnostic.

## Architecture boundaries quick-check commands

```bash
# Domain should not import NestJS
rg "^import .*@nestjs" src/domain

# Application should not import infrastructure/presentation directly
rg "^import .*@infrastructure" src/application
rg "^import .*@presentation" src/application

# Presentation should call application use cases
rg "^import .*@application" src/presentation

# Infrastructure should implement domain contracts
rg "@domain/repositories" src/infrastructure
```

If the first two checks return no matches, boundary rules are intact for those constraints.

