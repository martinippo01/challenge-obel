# NestJS Clean Architecture Project

A professional NestJS project implementing clean architecture principles with well-organized layers, PostgreSQL integration, and example user management module.

## Project Structure

```
src/
├── config/               # Configuration files
│   └── database.config.ts
├── domain/               # Domain Layer (Business Logic)
│   ├── entities/
│   │   └── user.entity.ts
│   └── repositories/
│       └── user.repository.interface.ts
├── application/          # Application Layer (Use Cases)
│   └── use-cases/
│       └── user/
│           ├── create-user.use-case.ts
│           ├── get-user.use-case.ts
│           ├── list-users.use-case.ts
│           ├── update-user.use-case.ts
│           └── delete-user.use-case.ts
├── infrastructure/       # Infrastructure Layer (Data & External Services)
│   └── persistence/
│       ├── entities/
│       │   └── user.orm-entity.ts
│       └── repositories/
│           ├── user.repository.impl.ts
│           └── mappers/
│               └── user.mapper.ts
├── presentation/         # Presentation Layer (Controllers & DTOs)
│   ├── controllers/
│   │   └── user.controller.ts
│   ├── dto/
│   │   └── user/
│   │       ├── create-user.dto.ts
│   │       ├── update-user.dto.ts
│   │       └── user-response.dto.ts
│   └── mappers/
│       └── user.dto-mapper.ts
├── modules/              # NestJS Modules
│   └── user.module.ts
├── app.module.ts         # Root module
└── main.ts              # Application bootstrap
```

## Architecture Layers

### 1. **Domain Layer** (`src/domain`)
- Pure business logic independent of any framework
- Contains entities and repository interfaces
- No external dependencies
- Defines contracts that other layers must implement

### 2. **Application Layer** (`src/application`)
- Use cases orchestrating the domain logic
- Implements business workflows
- Depends on domain but not on infrastructure or presentation
- Reusable across different interfaces (REST, GraphQL, etc.)

### 3. **Infrastructure Layer** (`src/infrastructure`)
- Implements repository interfaces from the domain
- Database configuration and ORM entities
- External service integrations
- Mappers to convert between domain and persistence models

### 4. **Presentation Layer** (`src/presentation`)
- HTTP controllers and API endpoints
- Data Transfer Objects (DTOs) for request/response validation
- Converts between HTTP requests and use case inputs
- User-facing API design

## Getting Started

### Prerequisites
- Node.js 16+ and npm
- PostgreSQL 12+

### Installation

```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your database credentials
```

### Running the Application

```bash
# Development mode (watch mode)
npm run start:dev

# Production build
npm run build
npm run start:prod

# Debug mode
npm run start:debug
```

### Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:cov

# Run e2e tests
npm run test:e2e
```

## User Module Example

The project includes a complete user management module demonstrating the clean architecture pattern:

### API Endpoints

```
POST   /api/users              # Create a new user
GET    /api/users              # List all users
GET    /api/users/:id          # Get user by ID
PUT    /api/users/:id          # Update user
DELETE /api/users/:id          # Delete user
```

### Create User Example

```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "password": "SecurePassword123"
  }'
```

### Response

```json
{
  "id": "abc123def456",
  "email": "john.doe@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "fullName": "John Doe",
  "isActive": true,
  "createdAt": "2024-04-22T10:30:00Z",
  "updatedAt": "2024-04-22T10:30:00Z"
}
```

## Environment Variables

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=nestjs_clean_arch

# Server
PORT=3000

# CORS
CORS_ORIGIN=http://localhost:3000
```

## Adding New Features

To add a new feature following the clean architecture pattern:

1. **Create Domain Layer**
   - Add entity in `src/domain/entities/`
   - Add repository interface in `src/domain/repositories/`

2. **Create Application Layer**
   - Add use cases in `src/application/use-cases/{feature}/`

3. **Create Infrastructure Layer**
   - Add ORM entity in `src/infrastructure/persistence/entities/`
   - Implement repository in `src/infrastructure/persistence/repositories/`
   - Add mapper in `src/infrastructure/persistence/repositories/mappers/`

4. **Create Presentation Layer**
   - Add DTOs in `src/presentation/dto/{feature}/`
   - Add controller in `src/presentation/controllers/`
   - Add DTO mapper in `src/presentation/mappers/`

5. **Create Module**
   - Add feature module in `src/modules/{feature}.module.ts`
   - Import in `app.module.ts`

## Dependencies

### Core
- `@nestjs/core` - NestJS framework core
- `@nestjs/common` - Common NestJS decorators and utilities
- `reflect-metadata` - Required for TypeScript decorators

### Database
- `@nestjs/typeorm` - TypeORM integration for NestJS
- `typeorm` - ORM library
- `pg` - PostgreSQL driver

### Validation & Security
- `class-validator` - DTO validation
- `class-transformer` - DTO transformation

### Configuration
- `@nestjs/config` - Configuration management

## Best Practices

1. **Dependency Injection**: Use NestJS DI system to manage dependencies
2. **Separation of Concerns**: Keep layers independent and focused
3. **Validation**: Validate all inputs at the presentation layer
4. **Error Handling**: Implement consistent error handling across layers
5. **Testing**: Write tests for each layer
6. **Documentation**: Keep code documented and this README updated

## Troubleshooting

### Database Connection Issues
- Ensure PostgreSQL is running
- Verify database credentials in `.env`
- Check database exists or set `synchronize: true` for auto-creation

### Port Already in Use
- Change `PORT` in `.env`
- Or kill process: `lsof -ti:3000 | xargs kill -9`

## License

MIT

## Author

Your Name