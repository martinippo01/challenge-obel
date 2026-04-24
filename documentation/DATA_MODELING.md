# Data Modeling

This project uses a relational data model in PostgreSQL with TypeORM entities and migrations as the source of truth.

## Modeling approach

- `users`, `roles`, and `permissions` are the core tables.
- Many-to-many relationships are modeled with explicit join tables:
  - `user_roles` links users to roles.
  - `role_permissions` links roles to permissions.
- UUIDs are used for primary keys.
- Business-level uniqueness is enforced with unique columns:
  - `users.email`
  - `roles.name`
  - `permissions.symbol`

## Entity overview

| Table | Purpose | Key fields |
|---|---|---|
| `users` | Stores user accounts | `id`, `email`, `firstName`, `lastName`, `password`, `isActive`, timestamps |
| `roles` | Groups permissions for authorization | `id`, `name`, `description`, timestamps |
| `permissions` | Atomic capabilities used by guards/policies | `id`, `symbol`, `description`, timestamps |
| `user_roles` | Assigns roles to users | Composite PK: `userId` + `roleId`, `createdAt` |
| `role_permissions` | Assigns permissions to roles | Composite PK: `roleId` + `permissionId`, `createdAt` |

## Relationship model

- One user can have many roles, and one role can belong to many users (`users` <-> `user_roles` <-> `roles`).
- One role can have many permissions, and one permission can be reused by many roles (`roles` <-> `role_permissions` <-> `permissions`).
- Join-table foreign keys use `ON DELETE CASCADE`, so relationship rows are removed automatically when a related user/role/permission is deleted.

## Notes from current migration

The roles/permissions migration seeds these permission symbols:

- `role.read`
- `role.write`
- `role.assign`

