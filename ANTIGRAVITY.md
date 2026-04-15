# Zenticare SaaS — Project Architecture

## Quick Index

| Section | Description |
|---------|-------------|
| [Tech Stack](#tech-stack) | Frameworks, DB, Auth, versions |
| [Monorepo Structure](#monorepo-structure) | Folder tree |
| [Applications](#applications) | doctors (3000) and patients (3001) |
| [Shared Packages](#shared-packages) | database, ui, eslint-config, typescript-config |
| [Turbo Commands](#turbo-commands) | dev, build, lint, check-types, format |
| [Pattern-Driven Architecture](#pattern-driven--modular-architecture) | Philosophy, file structure, naming, data layer, hooks |
| [Coding Rules](#coding-rules) | TypeScript, React, Styles, Convex, Ownership |
| [Environment Variables](#environment-variables) | Clerk, Convex, .env.local |
| [AI Agent Skills](#ai-agent-skills-agentsskills) | 16 skills: Clerk, Convex, daisyUI |
| [Agent Interaction](#agent-interaction) | Agent work protocol |
| [Development Ports](#development-ports) | Port table |

---

## General Overview

Zenticare is a medical SaaS platform built as a **Turborepo monorepo** with npm workspaces. It contains two independent frontend applications (doctors portal and patients portal) that share internal UI, configuration, and database packages.

---

## Tech Stack

| Layer                 | Technology                                          | Version         |
|-----------------------|-----------------------------------------------------|-----------------|
| **Monorepo**          | Turborepo                                           | ^2.9.6          |
| **Language**          | TypeScript                                          | 5.9.2           |
| **Frontend Framework**| Next.js (App Router)                                | 16.2.0          |
| **UI Library**        | React + React DOM                                   | ^19.2.0         |
| **Styling**           | Tailwind CSS v4 + daisyUI 5                         | ^4.2.2 / ^5.5.19 |
| **PostCSS**           | @tailwindcss/postcss                                | ^4.2.2          |
| **Database**          | Convex (reactive serverless backend)                | ^1.35.1         |
| **Authentication**    | Clerk (@clerk/nextjs)                               | ^7.2.1          |
| **Linting**           | ESLint 9 (flat config) + Prettier                   | ^9.39.1 / ^3.7.4 |
| **Typography**        | Geist Sans & Geist Mono (local `.woff` fonts)       | —               |
| **Node.js**           | Minimum required                                    | >=18            |
| **Package Manager**   | npm                                                 | 10.9.3          |
| **MCP Dev Tools**     | next-devtools-mcp                                   | latest          |

---

## Monorepo Structure

```
zenticare-saas/
├── apps/
│   ├── doctors/          # Doctors portal (Next.js, port 3000)
│   └── patients/         # Patients portal (Next.js, port 3001)
├── packages/
│   ├── database/         # Shared Convex backend (@repo/database)
│   ├── ui/               # Shared React components (@repo/ui)
│   ├── eslint-config/    # Shared ESLint configs (@repo/eslint-config)
│   └── typescript-config/ # Shared TypeScript configs (@repo/typescript-config)
├── turbo.json            # Turborepo pipeline config
├── package.json          # Monorepo root (workspaces)
└── .mcp.json             # MCP server configuration
```

---

## Applications

### `apps/doctors` — Doctors Portal

- **Purpose:** Primary interface for medical professionals. Patient management, appointments, calendar, WhatsApp templates, and admin panel.
- **Development port:** `3000`
- **Framework:** Next.js 16 with App Router (`app/` directory)
- **Auth:** Clerk (`@clerk/nextjs`)
- **Shared UI:** Imports components from `@repo/ui` (e.g., `@repo/ui/button`)
- **Styling:** Tailwind CSS v4 + daisyUI 5 via PostCSS
- **Typography:** Geist Sans + Geist Mono (local fonts)

### `apps/patients` — Patients Portal

- **Purpose:** Interface for patients to interact with the platform (book appointments, view history, communicate with their doctor).
- **Development port:** `3001`
- **Framework:** Next.js 16 with App Router (`app/` directory)
- **Auth:** Clerk (`@clerk/nextjs`)
- **Shared UI:** Imports components from `@repo/ui`
- **Styling:** Tailwind CSS v4 + daisyUI 5 via PostCSS
- **Typography:** Geist Sans + Geist Mono (local fonts)

---

## Shared Packages

### `packages/database` (`@repo/database`)

- Serverless backend with **Convex**.
- `convex/` folder contains query, mutation, and action functions.
- No `schema.ts` defined yet (data model is permissive/`any`).
- Generated files in `convex/_generated/` (do not edit manually).
- Regenerate types: `npx convex dev`.

### `packages/ui` (`@repo/ui`)

- Shared React component library used by both apps.
- Exports components via `"exports": { "./*": "./src/*.tsx" }`.
- Existing components: `Button`, `Card`, `Code`.
- Client components use the `"use client"` directive.
- TSConfig extends `@repo/typescript-config/react-library.json`.
- ESLint uses the `react-internal` configuration.
- Generate new components with: `turbo gen react-component`.

### `packages/eslint-config` (`@repo/eslint-config`)

Three exported configurations:

| Export            | Usage                                      |
|-------------------|--------------------------------------------|
| `./base`          | Base config: JS recommended + TS + Prettier + Turbo |
| `./next-js`       | For Next.js apps: React, React Hooks, Core Web Vitals |
| `./react-internal`| For internal React libraries (`ui` package) |

### `packages/typescript-config` (`@repo/typescript-config`)

Three compilation profiles:

| File                 | Usage                                    |
|----------------------|------------------------------------------|
| `base.json`          | Shared base: strict, ES2022, NodeNext    |
| `nextjs.json`        | Next.js apps: Bundler resolution, JSX preserve, noEmit |
| `react-library.json` | React library: JSX react-jsx             |

---

## Turbo Commands

Run from the monorepo **root**:

| Command                | Description                                             |
|------------------------|---------------------------------------------------------|
| `npm run dev`          | `turbo run dev` — Starts all apps in parallel (doctors:3000, patients:3001) |
| `npm run build`        | `turbo run build` — Production build for all apps       |
| `npm run lint`         | `turbo run lint` — Runs ESLint on all apps and packages |
| `npm run check-types`  | `turbo run check-types` — TypeScript type checking      |
| `npm run format`       | `prettier --write "**/*.{ts,tsx,md}"` — Formats all code |

### Turbo Pipeline (`turbo.json`)

```jsonc
{
  "ui": "tui",  // Interactive terminal UI
  "tasks": {
    "build":       { "dependsOn": ["^build"], "outputs": [".next/**", "!.next/cache/**"] },
    "lint":        { "dependsOn": ["^lint"] },
    "check-types": { "dependsOn": ["^check-types"] },
    "dev":         { "cache": false, "persistent": true }  // No cache, persistent process
  }
}
```

---

## Pattern-Driven & Modular Architecture

All project code follows a **Pattern-Driven and Modular** architecture. These rules are **strict** and must be followed in all new and refactored code.

### 1. Architecture Philosophy

#### Separation of Concerns

Business logic must **NEVER** reside in the UI component. A `.tsx` component should only:
- Render JSX.
- Call hooks to obtain data and handlers.
- Delegate all logic to lower layers.

```tsx
// ❌ BAD — business logic in the component
export function PatientProfile({ id }: { id: string }) {
  const [patient, setPatient] = useState(null);
  useEffect(() => {
    fetch(`/api/patients/${id}`).then(r => r.json()).then(setPatient);
  }, [id]);
  const age = new Date().getFullYear() - new Date(patient?.birthDate).getFullYear();
  return <div>{patient?.name} ({age} years old)</div>;
}

// ✅ GOOD — pure component, logic delegated to hook
export function PatientProfile({ id }: { id: string }) {
  const { patient, age } = usePatientProfile(id);
  return <div>{patient?.name} ({age} years old)</div>;
}
```

#### Presentational Components

UI components must be **pure** and focused solely on rendering. They receive data and callbacks via props/hooks and do not handle complex state or side effects directly.

#### Line Limit

> **Rule: No file should exceed 300 lines of code.**

If a file exceeds this limit, it **must** be refactored and split following the colocated file structure described below.

### 2. Colocated File Organization

Each feature or complex component must follow this colocated file structure within its folder:

```
features/appointments/
├── AppointmentList.tsx          # UI only and hook calls
├── AppointmentList.hooks.ts     # State logic, effects, and handlers
├── AppointmentList.services.ts  # Business logic, calculations, API/DB calls
├── AppointmentList.utils.ts     # Specific helper functions
├── AppointmentList.constants.ts # Static values and constants
├── AppointmentList.types.ts     # TypeScript interfaces and types
├── AppointmentList.actions.ts   # (If applicable) Server Actions for mutations
└── components/                  # Internal sub-components for this feature
    ├── AppointmentCard.tsx
    └── AppointmentFilters.tsx
```

#### File Responsibilities

| File | What it contains | What it does NOT contain |
|------|-----------------|--------------------------|
| `.tsx` | JSX, hook calls, props destructuring | Complex state, fetching, calculations |
| `.hooks.ts` | `useState`, `useEffect`, handlers, query composition | Pure business logic, calculations |
| `.services.ts` | Heavy business logic, data transformations, Convex/API calls | JSX, React hooks |
| `.utils.ts` | Pure helper functions (formatting, validation, parsing) | State, effects, side effects |
| `.constants.ts` | Enums, default values, select options, keys | Logic, functions |
| `.types.ts` | Interfaces, types, module generics | Implementation |
| `.actions.ts` | Server Actions (Next.js), Zod validation, revalidation | UI logic, hooks |

> **Rule:** Not all files are required. Only create the ones the feature needs. A simple component can be just `.tsx` + `.types.ts`.

### 3. Function Naming Conventions

| Type | Prefix | Example | Where used |
|------|--------|---------|------------|
| **Hooks** | `use` | `useUserForm`, `usePatientList` | `.hooks.ts` |
| **Handlers** (inside hooks) | `handle` | `handleSave`, `handleDelete`, `handleFilterChange` | `.hooks.ts` |
| **Props callbacks** | `on` | `onSave`, `onDelete`, `onChange` | Component `.tsx` props |
| **Services** | descriptive verb | `fetchPatients`, `calculateAge`, `validateForm` | `.services.ts` |
| **Utils** | descriptive verb | `formatDate`, `parsePhone`, `slugify` | `.utils.ts` |

```tsx
// Full naming flow example:

// AppointmentForm.types.ts
export interface AppointmentFormProps {
  onSave: (data: AppointmentData) => void;  // ← "on" prefix in props
  onCancel: () => void;
}

// AppointmentForm.hooks.ts
export function useAppointmentForm() {       // ← "use" prefix in hook
  const handleSave = async () => { ... };    // ← "handle" prefix in handler
  const handleCancel = () => { ... };
  return { handleSave, handleCancel };
}

// AppointmentForm.tsx
export function AppointmentForm({ onSave, onCancel }: AppointmentFormProps) {
  const { handleSave, handleCancel } = useAppointmentForm();
  return <form onSubmit={handleSave}>...</form>;
}
```

### 4. Data Layer & Mutations

#### Server Actions (Next.js)

Server Actions must act as **thin controllers**. Their strict flow is:

```
Validate Input (Zod) → Call Service (.services.ts) → Revalidate Cache → Return Response
```

```ts
// AppointmentList.actions.ts
"use server";

import { z } from "zod";
import { createAppointment } from "./AppointmentList.services";
import { revalidatePath } from "next/cache";

const CreateSchema = z.object({
  patientId: z.string(),
  date: z.string().datetime(),
  notes: z.string().optional(),
});

export async function createAppointmentAction(formData: FormData) {
  // 1. Validate input
  const parsed = CreateSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.flatten() };

  // 2. Call service
  const result = await createAppointment(parsed.data);

  // 3. Revalidate cache
  revalidatePath("/appointments");

  // 4. Return response
  return { success: true, data: result };
}
```

> **Rule:** A Server Action must NEVER contain direct business logic. That logic belongs in `.services.ts`.

#### Data Access Layer

Direct queries to Convex, external APIs, or other data sources must live in `.services.ts` files to be **reusable and testable**.

```ts
// AppointmentList.services.ts
import { ConvexHttpClient } from "convex/browser";
import { api } from "@repo/database/convex/_generated/api";

export async function fetchAppointmentsByDoctor(doctorId: string) {
  // Centralized and reusable data access logic
  const client = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
  return client.query(api.appointments.listByDoctor, { doctorId });
}

export function calculateNextAvailableSlot(appointments: Appointment[]): Date {
  // Pure business logic, testable without UI dependencies
  // ...
}
```

### 5. Hook Scalability (Scaling the Hooks Layer)

When a hook grows too large (approaching the 300-line limit), apply this scaling strategy:

#### Step 1: Split into focused sub-hooks

```ts
// ❌ One giant hook
export function useAppointments() {
  // 50 lines of queries...
  // 80 lines of form logic...
  // 40 lines of filters...
  // 60 lines of pagination...
}

// ✅ Focused sub-hooks
export function useAppointments() {
  const query = useAppointmentsQuery(filters);
  const form = useAppointmentForm();
  const filters = useAppointmentFilters();
  const pagination = useAppointmentPagination();

  return { ...query, ...form, ...filters, ...pagination };
}
```

#### Step 2: Extract complex state to a reducer

If state has multiple interrelated transitions, extract to a `.reducer.ts`:

```ts
// AppointmentList.reducer.ts
type State = { ... };
type Action = 
  | { type: "SET_FILTER"; payload: FilterOptions }
  | { type: "SELECT_APPOINTMENT"; payload: string }
  | { type: "RESET" };

export function appointmentReducer(state: State, action: Action): State {
  switch (action.type) {
    case "SET_FILTER": return { ...state, filters: action.payload };
    case "SELECT_APPOINTMENT": return { ...state, selectedId: action.payload };
    case "RESET": return initialState;
  }
}
```

#### Step 3: Context for deeply shared state

When a feature has a deep component hierarchy that needs to share state, use `context/` folders:

```
features/appointments/
├── context/
│   ├── AppointmentContext.tsx      # Provider + useAppointmentContext hook
│   └── AppointmentContext.types.ts
├── AppointmentList.tsx
├── AppointmentList.hooks.ts
└── components/
    ├── AppointmentCard.tsx          # Consumes context without prop drilling
    └── AppointmentTimeline.tsx
```

```tsx
// context/AppointmentContext.tsx
"use client";

import { createContext, useContext } from "react";
import type { AppointmentContextType } from "./AppointmentContext.types";

const AppointmentContext = createContext<AppointmentContextType | null>(null);

export function useAppointmentContext() {
  const ctx = useContext(AppointmentContext);
  if (!ctx) throw new Error("useAppointmentContext must be used within AppointmentProvider");
  return ctx;
}

export function AppointmentProvider({ children }: { children: React.ReactNode }) {
  // ... provider state and logic
  return (
    <AppointmentContext.Provider value={value}>
      {children}
    </AppointmentContext.Provider>
  );
}
```

### Architecture Visual Summary

```
┌─────────────────────────────────────────────────────┐
│                    Component.tsx                     │
│              (JSX only + hook calls)                │
└──────────────────────┬──────────────────────────────┘
                       │ uses
┌──────────────────────▼──────────────────────────────┐
│                  Component.hooks.ts                  │
│         (State, effects, handlers, queries)          │
└──────┬───────────────┬──────────────────────────────┘
       │ imports       │ imports
┌──────▼──────┐  ┌─────▼─────────────┐  ┌─────────────┐
│ .services.ts│  │ .utils.ts         │  │ .types.ts   │
│ (Business,  │  │ (Pure helpers,    │  │ (Interfaces,│
│  API, DB)   │  │  formatting)      │  │  types)     │
└─────────────┘  └───────────────────┘  └─────────────┘
       │
┌──────▼──────────────────────────────────────────────┐
│              Convex / API / Server Actions           │
│               (packages/database/convex/)            │
└─────────────────────────────────────────────────────┘
```

---

## Coding Rules

The following rules are derived from the existing codebase style:

### TypeScript

- **Strict mode enabled** in all profiles (`"strict": true`).
- **`strictNullChecks: true`** explicit in apps and UI package.
- **`noUncheckedIndexedAccess: true`** in base config.
- **`isolatedModules: true`** — each file must be a valid module individually.
- All files use **ES Modules** (`"type": "module"` in package.json).
- Prefer `type` for type imports: `import type { Metadata } from "next"`.

### React & Components

- **Do not import React explicitly** — the automatic JSX transform handles it (`react/react-in-jsx-scope: off`).
- Components with client interactivity must have `"use client"` at the top of the file.
- Props are defined with **TypeScript interfaces**, inline or exported.
- Functional components with **arrow functions** for local components, **function declarations** for components exported from `@repo/ui`.
- Return type `JSX.Element` in `@repo/ui` components; implicit in app components.
- Use `Readonly<>` to type layout props.

### Styles

- **Tailwind CSS v4** with the `@import "tailwindcss"` directive in `globals.css`.
- **daisyUI 5** as plugin: `@plugin "daisyui"` in `globals.css`.
- PostCSS configured with `@tailwindcss/postcss`.
- CSS Modules (`page.module.css`) available for page-specific styles.
- Use **daisyUI classes** for common components (buttons, cards, modals, etc.).

### ESLint & Formatting

- ESLint 9 with **flat config** (not `.eslintrc`).
- `--max-warnings 0` — no warnings allowed in CI.
- Prettier handles code formatting.
- `only-warn` plugin downgrades errors to warnings in development.
- `turbo` plugin active to prevent undeclared environment variables.

### Convex (Backend)

- Backend functions in `packages/database/convex/`.
- **Always read** `convex/_generated/ai/guidelines.md` before writing Convex functions.
- Do not edit files in `convex/_generated/`.
- Target `ESNext`, module `ESNext`, moduleResolution `Bundler` for Convex code.

#### ⚠️ Schema-less Rule (Safety)

The current Convex data model is **permissive** (`any`) because no `schema.ts` is defined. This means the agent **can invent arbitrary fields** in mutations if not careful.

**Mandatory protocol before creating/modifying a mutation:**

1. **Read existing files** in `packages/database/convex/` to infer the fields that already exist in each table.
2. **Do not invent new fields** without explicit user confirmation.
3. **Document in a comment** the fields each mutation uses, especially if there is no `schema.ts`.
4. If a new field is needed, **propose it first** to the user before implementing it.
5. Prioritize creating a formal `schema.ts` when adding new tables or fields.

### Code Organization

- Shared components go in `packages/ui/src/`. They are exported as `@repo/ui/<name>`.
- Backend logic and DB schemas go in `packages/database/convex/`.
- ESLint and TypeScript configurations are centralized in their respective packages.
- Each app maintains its own `app/` directory with Next.js App Router.
- Local fonts go in `app/fonts/` within each app.

#### 🏠 Ownership Boundary

Decision rule to determine **where to place** a new component:

```
Does the component have business logic or depend on Convex/Clerk?
  ├── YES → It stays in the corresponding app (apps/doctors/ or apps/patients/)
  └── NO → Is it purely presentational and reusable?
       ├── YES → It MUST go in packages/ui/src/ as @repo/ui/<name>
       └── NO → Is it a hook or utility without UI?
            ├── YES → Create in packages/ as a shared package
            └── NO → It stays in the corresponding app
```

**Concrete examples:**

| Component | Where does it go? | Reason |
|-----------|-------------------|--------|
| Generic `<DataTable>` with sort/filter | `packages/ui/src/` | Pure presentation, reusable |
| `<PatientsList>` using `useQuery(api.patients.list)` | `apps/doctors/` | Business logic + Convex |
| `<StatusBadge color={...}>` | `packages/ui/src/` | Pure presentation |
| `<AppointmentForm>` with Convex mutations | `apps/doctors/` | Specific business logic |
| Generic `<Modal>` | `packages/ui/src/` | Pure presentation |

> **Golden rule:** If you can copy the component to another SaaS project without modifying it, it goes in `@repo/ui`.

### Naming Conventions

- **Component files:** `camelCase.tsx` (e.g., `button.tsx`, `card.tsx`).
- **Component exports:** `PascalCase` (e.g., `Button`, `Card`).
- **Config files:** `camelCase` or `kebab-case` (e.g., `eslint.config.js`, `postcss.config.mjs`).
- **Internal packages:** `@repo/` prefix (e.g., `@repo/ui`, `@repo/database`).

---

## Environment Variables

- Clerk requires `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY`.
- Convex requires `CONVEX_DEPLOYMENT` and `NEXT_PUBLIC_CONVEX_URL`.
- Local environment variables go in `.env.local` (excluded from git).
- Turbo recognizes `.env*` files as build pipeline inputs.

---

## AI Agent Skills (`.agents/skills/`)

The `.agents/skills/` directory contains **16 skills** that extend the AI agent's capabilities for specialized project tasks. Each skill has a `SKILL.md` file with detailed instructions that the agent **must read before executing** the corresponding task.

### Structure

```
.agents/
└── skills/
    ├── clerk/                          # Main Clerk router
    ├── clerk-backend-api/              # Clerk REST API
    ├── clerk-chrome-extension-patterns/ # Chrome extension auth
    ├── clerk-custom-ui/                # Custom sign-in/sign-up flows
    ├── clerk-nextjs-patterns/          # Middleware, Server Actions, caching
    ├── clerk-orgs/                     # B2B multi-tenant organizations
    ├── clerk-react-patterns/           # React hooks and protected routes
    ├── clerk-setup/                    # Initial Clerk setup
    ├── clerk-testing/                  # E2E testing with Playwright/Cypress
    ├── clerk-webhooks/                 # Webhooks and event synchronization
    ├── convex-create-component/        # Isolated Convex components
    ├── convex-migration-helper/        # Safe schema migrations
    ├── convex-performance-audit/       # Convex performance audit
    ├── convex-quickstart/              # Initial Convex setup
    ├── convex-setup-auth/              # Convex authentication
    └── daisyui/                        # Complete daisyUI 5 reference
```

### Skills by Category

#### 🔐 Clerk — Authentication (10 skills)

| Skill | When to use |
|-------|-------------|
| `clerk` | **Main router.** Detects the SDK version and routes to the correct skill based on the task. |
| `clerk-setup` | Adding Clerk to the project for the first time. Framework-based quickstart. |
| `clerk-nextjs-patterns` | Middleware, Server Actions, caching, API route protection in Next.js. |
| `clerk-react-patterns` | Hooks (`useAuth`, `useUser`), protected routes, guards in React SPA. |
| `clerk-custom-ui` | Custom sign-in/sign-up flows with `useSignIn`/`useSignUp`. Themes and appearance. |
| `clerk-orgs` | B2B multi-tenant apps: organizations, roles (RBAC), members, URL slugs. |
| `clerk-webhooks` | Real-time events, data synchronization, notifications. |
| `clerk-testing` | E2E testing of auth flows with Playwright or Cypress. |
| `clerk-backend-api` | Browse and execute Clerk REST API endpoints. |
| `clerk-chrome-extension-patterns` | Chrome extension auth (popup, sidepanel, service workers). |

> **Note:** This project uses `@clerk/nextjs` v7+ (current SDK, not Core 2 LTS).

#### 🗄️ Convex — Backend (5 skills)

| Skill | When to use |
|-------|-------------|
| `convex-quickstart` | Initialize Convex or add it to an existing app. Templates, providers, env vars. |
| `convex-setup-auth` | Configure auth with Convex: `ctx.auth.getUserIdentity()`, users table, RBAC. |
| `convex-create-component` | Create isolated Convex components with `defineComponent`, own tables, wrappers. |
| `convex-migration-helper` | Safe schema migrations: widen → migrate → narrow. `@convex-dev/migrations`. |
| `convex-performance-audit` | Performance audit: OCC conflicts, read amplification, subscription cost. |

#### 🎨 UI — daisyUI (1 skill)

| Skill | When to use |
|-------|-------------|
| `daisyui` | **Always apply.** Complete daisyUI 5 reference: all components, classes, custom themes, semantic colors, and usage rules with Tailwind CSS v4. |

### Agent Rules

1. **Before executing a specialized task**, read the corresponding `SKILL.md` with `view_file`.
2. The `daisyui` skill has `alwaysApply: true` — its rules apply **whenever** markup/styles are written.
3. The `clerk` skill acts as a **router**: it detects the SDK version and redirects to the specific skill.
4. For Convex, **always read** `convex/_generated/ai/guidelines.md` in addition to the corresponding skill.
5. Clerk skills differentiate between **current SDK** (v7+) and **Core 2 LTS** (v5-v6). This project uses the current SDK.

---

## Agent Interaction

Work protocol that the agent must follow to ensure monorepo integrity.

### After creating/modifying components in `@repo/ui`

1. **Run build** to propagate types to consuming apps:
   ```bash
   npx turbo run build --filter=@repo/ui
   ```
2. Verify that apps importing the component have no type errors:
   ```bash
   npm run check-types
   ```

### Before proposing Convex changes

1. Read existing files in `packages/database/convex/` to understand the current state of tables and fields.
2. If there is no `schema.ts`, infer the schema from existing function files.
3. Do not create fields, tables, or indexes without prior codebase context.

### Before creating a new component

1. Consult the [Ownership Boundary](#-ownership-boundary) to decide whether it goes in `@repo/ui` or in the app.
2. If it goes in `@repo/ui`, verify that a similar component doesn't already exist.
3. If it goes in an app, verify that it is not reusable before discarding it as shared.

### Post-change verification order

```bash
# 1. Lint the entire monorepo
npm run lint

# 2. Type checking
npm run check-types

# 3. Production build (if shared packages were modified)
npm run build
```

---

## Development Ports

| App        | Port   |
|------------|--------|
| `doctors`  | 3000   |
| `patients` | 3001   |
