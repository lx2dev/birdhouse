# GitHub Copilot Instructions for Birdhouse

## Project Overview

Birdhouse (formerly Terramox) is a Next.js 16 application for managing Proxmox VMs. It uses a modular architecture with tRPC, Drizzle ORM, and Tailwind CSS.

## Architecture & Structure

### Core Stack
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 (using `cn` utility)
- **API**: tRPC v11 (App Router integration)
- **Database**: Drizzle ORM with Postgres (`postgres` driver)
- **Auth**: `better-auth`
- **State**: TanStack Query v5 (via tRPC)

### Directory Structure
- `src/modules/`: Feature-based modules (e.g., `dashboard`, `admin`).
  - `schemas/`: Zod schemas for validation.
  - `server/api/`: tRPC routers for the module.
  - `ui/`: Module-specific reusable components.
  - `views/`: Page-level components.
- `src/server/`: Backend core.
  - `api/`: tRPC root and initialization.
  - `db/`: Drizzle schema and connection.
  - `workers/`: Background tasks (e.g., provisioning).
- `src/lib/proxmox/`: Proxmox API integration.

## Development Conventions

### Data Fetching (tRPC)

- Define routers in `src/modules/*/server/api/*.ts`.
- Aggregate routers in `src/server/api/root.ts`.
- Use the `api` client on the frontend:
  ```tsx
  import { api } from "@/lib/api/client"
  // ...
  const { data } = api.compute.list.useQuery()
  const mutation = api.compute.create.useMutation()
  ```

### Database (Drizzle ORM)

- Define schemas in `src/server/db/schema.ts`.
- Use `createTable` helper to ensure `birdhouse_` prefix.
- Use `drizzle-kit` for migrations.
- Example:
  ```typescript
  export const vm = createTable("vm", (t) => ({
    id: t.text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    // ...
  }))
  ```

### UI & Styling

- Use Tailwind CSS v4.
- Merge classes using the `cn` utility:
  ```tsx
  import { cn } from "@/lib/utils"
  // ...
  <div className={cn("bg-primary", className)} />
  ```
- Use `sonner` for toast notifications.
- Use `@base-ui/react` and custom components in `src/components/ui`.

### Forms

- Use `react-hook-form` with `zod` resolvers.
- Define schemas in `src/modules/*/schemas/index.ts`.
- Example:
  ```tsx
  const form = useForm({ resolver: zodResolver(createVMSchema) })
  ```

### Authentication

- Use `better-auth` hooks for client-side auth.
- Auth configuration is in `src/server/auth/index.ts`.

### Proxmox Integration

- Use `getProxmoxClient()` from `@/lib/proxmox`.
- Handle TLS verification skipping via `PM_TLS_SKIP_VERIFY` env var.

## Key Workflows

### VM Provisioning

- VMs are created with status `provisioning`.
- The worker in `src/server/workers/provision-runner.ts` polls for these VMs and executes provisioning logic (cloning, config).

### Environment Variables

- Defined in `src/env.ts` using `@t3-oss/env-nextjs`.
- Access via `import { env } from "@/env"`.
