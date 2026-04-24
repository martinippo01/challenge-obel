# Authentication

This project uses a simple token-based authentication approach.

## How it works

- Requests must include an `Authorization` header with a `Bearer` token.
- `AuthMiddleware` reads the token and attaches an auth context to the request.
- Two token types are supported:
  - **Admin token**: grants `role.read`, `role.write`, and `role.assign`
  - **Read-only token**: grants `role.read`
- If the token is missing or invalid, the API returns `401 Unauthorized`.

## Authorization and permissions

After authentication, `PermissionsGuard` checks whether the route requires permissions.
- If a route has no permission metadata, it is allowed.
- If permissions are required and the token does not have them, the API returns `403 Forbidden`.

## Protected actions

- `role.write`: create and update roles
- `role.assign`: assign and remove roles from users
- `role.read`: list and read role-related data

## Environment variables

- `AUTH_TOKEN`: admin token
- `AUTH_READ_TOKEN`: read-only token

## Notes

- There is no login endpoint in the current implementation.
- The middleware is configured globally in the application module, so all routes are checked unless excluded.
- Swagger is configured with bearer authentication support in `src/main.ts`.

