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

### Docker Setup

The application is fully dockerized and can be run using Docker and Docker Compose.

#### Prerequisites
- Docker
- Docker Compose

#### Running with Docker Compose

The easiest way to run the entire application stack:

```bash
# Start all services (PostgreSQL + NestJS app)
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Remove volumes (clean database)
docker-compose down -v
```

For VM deployment (or any host that should pull from Docker Hub instead of building locally), use the secondary compose file:

```bash
docker-compose -f docker-compose.vm.yml pull
docker-compose -f docker-compose.vm.yml up -d
```

`docker-compose.vm.yml` expects `IMAGE_NAME` and `IMAGE_TAG` in `.env` (defaults to `your-dockerhub-username/nestjs-app:latest`).

#### Environment Configuration for Docker

When using Docker, update your `.env` file:

```env
# Database Configuration
DB_HOST=postgres        # Service name from docker-compose
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=nestjs_clean_arch

# Server Configuration
PORT=3000
CORS_ORIGIN=http://localhost:3000
```

#### Building Docker Image

Build the Docker image manually:

```bash
docker build -t nestjs-clean-arch:latest .
```

#### Running Docker Container Standalone

```bash
# Run the container with PostgreSQL link
docker run -d \
  --name nestjs_app \
  --network nestjs_network \
  -e DB_HOST=postgres \
  -e DB_PORT=5432 \
  -e DB_USERNAME=postgres \
  -e DB_PASSWORD=postgres \
  -e DB_NAME=nestjs_clean_arch \
  -p 3000:3000 \
  nestjs-clean-arch:latest
```

#### Docker Health Checks

Both PostgreSQL and the NestJS application have health checks configured:

```bash
# Check service health
docker-compose ps

# View health status
docker ps --format "table {{.Names}}\t{{.Status}}"
```

#### Troubleshooting Docker

**App container won't start:**
```bash
# View container logs
docker-compose logs nestjs

# Check if postgres is running
docker-compose logs postgres
```

**Database connection error:**
- Ensure `DB_HOST=postgres` in `.env` (not `localhost`)
- Check PostgreSQL is healthy: `docker-compose ps`
- Verify environment variables are set correctly

**Port already in use:**
```bash
# Change port in docker-compose.yml or use different port
docker-compose down
```

### Production Deployment to Azure

This project includes Infrastructure-as-Code using Terraform and automated CI/CD with GitHub Actions for deployment to Azure.

**Quick Start:**
```bash
# 1. Configure and deploy infrastructure
cd terraform
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars with your Azure region
terraform init
terraform apply

# 2. Add 7 GitHub Secrets (see DEPLOYMENT.md for detailed instructions)
#    - DOCKER_HUB_USERNAME, DOCKER_HUB_PASSWORD
#    - SSH_HOST, SSH_USER, SSH_PRIVATE_KEY
#    - DB_PASSWORD, CORS_ORIGIN

# 3. Push to main branch - GitHub Actions will automatically deploy!
git push origin main
```

**Features:**
- ✅ Azure VM with Docker & Docker Compose
- ✅ Docker Hub for image storage (free tier included, Docker login automatic)
- ✅ Terraform for Infrastructure-as-Code
- ✅ GitHub Actions for automated CI/CD
- ✅ Terraform state stored in Azure Storage (optional)
- ✅ SSH deployment with security groups
- ✅ Cost-effective setup (~$37-40/month)

**See [DEPLOYMENT.md](./DEPLOYMENT.md) for:**
- Complete step-by-step setup guide
- Docker Hub account & credentials setup
- GitHub Secrets configuration
- Troubleshooting guide
- Monitoring instructions

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

POST   /api/roles              # Create a role (requires role.write)
PUT    /api/roles/:id          # Edit a role (requires role.write)
GET    /api/roles              # List roles
GET    /api/roles/:id          # Get role by id
POST   /api/users/:userId/roles/:roleId    # Assign role to user (requires role.assign)
DELETE /api/users/:userId/roles/:roleId    # Delete role assignment from user (requires role.assign)
GET    /api/users/:userId/roles            # List roles of a user
```

### OpenAPI / Swagger

- Swagger UI is available at `/docs`
- Auth is configured as `Bearer` token in the UI

### Authenticated API Call Examples

Use tokens from your `.env` (`AUTH_TOKEN` for admin actions, `AUTH_READ_TOKEN` for read-only):

```bash
export AUTH_TOKEN=dev-admin-token
export AUTH_READ_TOKEN=dev-read-token
```

Create a role (allowed with `AUTH_TOKEN`, expects `201`):

```bash
curl -i -X POST http://localhost:3000/api/roles \
  -H "Authorization: Bearer ${AUTH_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "manager",
    "description": "Manager role",
    "permissionSymbols": ["role.read", "role.assign"]
  }'
```

List roles (allowed with `AUTH_READ_TOKEN`, expects `200`):

```bash
curl -i http://localhost:3000/api/roles \
  -H "Authorization: Bearer ${AUTH_READ_TOKEN}"
```

Assign role to user (allowed with `AUTH_TOKEN`, expects `204`):

```bash
curl -i -X POST \
  "http://localhost:3000/api/users/550e8400-e29b-41d4-a716-446655440001/roles/<ROLE_ID>" \
  -H "Authorization: Bearer ${AUTH_TOKEN}"
```

Forbidden example: assign role with read-only token (expects `403`):

```bash
curl -i -X POST \
  "http://localhost:3000/api/users/550e8400-e29b-41d4-a716-446655440001/roles/<ROLE_ID>" \
  -H "Authorization: Bearer ${AUTH_READ_TOKEN}"
```

Unauthorized example: missing token (expects `401`):

```bash
curl -i http://localhost:3000/api/roles
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

# Authentication
AUTH_TOKEN=dev-admin-token
AUTH_READ_TOKEN=dev-read-token
```

### Authorization Model

- `AUTH_TOKEN`: full role management permissions (`role.read`, `role.write`, `role.assign`)
- `AUTH_READ_TOKEN`: read-only access (`role.read`)

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