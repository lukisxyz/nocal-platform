# Claude Code Rules for NoCal Platform

## General Guidelines

### UI Components
- **Always use shadcn/ui** for all UI components
- When creating new shadcn components, use: `npx shadcn@latest add COMPONENT_NAME`

### Package Management
- **Always use `pnpm`** when installing new packages
- Never use `npm` or `yarn`

### Code Quality
- **Never put comments in code** - code should be self-explanatory
- **Never use `console.log`** - use `toast` from 'sonner' instead
- **Never use `alert()`** - use `toast` from 'sonner' instead

### Error Handling
- When catching errors that are not used, prefix the error parameter with underscore:
  ```typescript
  } catch (_error) {
    toast.error('Operation failed')
  }
  ```
- Always handle errors gracefully with appropriate toast notifications

### API Routes
- **Always put API routes in the `api` folder**
- Keep API routes organized by feature or domain
- The file name determines the API path (e.g., `account.ts` becomes `/api/account`)
- Example structure:
  ```
  src/routes/api/
    ├── account.ts      → /api/account
    ├── booking.ts      → /api/booking
    └── profile.ts      → /api/profile
  ```

### Framework
- This project uses **TanStack Start** for the full-stack framework
- API routes are defined using TanStack Start's file-based routing

### Data Fetching
- **All API calls use TanStack Query** (via `@tanstack/react-query`)
- **All mutations use TanStack Query mutations**
- Keep all queries and mutations in the `queries` folder
- Example structure:
  ```
  src/queries/
  ├── use-profile.ts
  ├── use-booking-sessions.ts
  └── use-booking-mutations.ts
  ```

### Type Definitions
- **Prefer `type` over `interface`** for type definitions
- Use `type` for all custom types, interfaces, and type aliases

### TanStack Start Best Practices

#### File-Based Routing
- Use the file system to define routes (e.g., `/dashboard/profile.tsx` → `/dashboard/profile`)
- Place route files in `src/routes/`
- Nested folders create nested routes automatically

#### Route Configuration
- Define routes using `createFileRoute`:
  ```typescript
  export const Route = createFileRoute('/path/to/route')({
    component: RouteComponent,
    // Optional configurations
    beforeLoad: () => ({ /* data */ }),
    loader: () => ({ /* data */ }),
    server: {
      middleware: [authMiddleware],
    },
  })
  ```

#### Middleware
- Put middleware in `src/lib/` (e.g., `auth-middleware.ts`)
- Apply middleware in route configuration:
  ```typescript
  server: {
    middleware: [authMiddleware],
  }
  ```

#### Server vs Client Components
- Default to **server components** for better performance
- Use `'use client'` only when you need:
  - State management
  - Event handlers
  - Browser APIs
  - React hooks

#### Data Loading
- Use `loader` for server-side data fetching
- Use `useLoaderData` in components to access loader data
- Use **TanStack Query** for client-side data fetching and mutations

#### Error Handling
- Use `errorComponent` for route-level error boundaries
- Handle errors gracefully with toast notifications
- Always provide user-friendly error messages

#### Directory Structure
```
src/
├── routes/           # File-based routes
│   ├── api/         # API routes
│   ├── _index.tsx   # Home page (/)
│   └── dashboard/   # Dashboard routes
├── lib/             # Utilities, middleware, configs
├── components/      # Reusable UI components
├── queries/         # TanStack Query hooks
└── types/           # Shared type definitions
```

#### Authentication
- Implement authentication middleware for protected routes
- Check authentication status in `beforeLoad` or middleware
- Redirect unauthenticated users to login page

#### Type Safety
- Share types between server and client
- Define loader and action types explicitly
- Use TypeScript strict mode

### Toast Notifications
The app uses Sonner for toast notifications. Import and use it like:
```typescript
import { toast } from 'sonner'

// Success
toast.success('Operation completed successfully')

// Error
toast.error('Operation failed')

// Info
toast.info('Additional information')
```

### shadcn/ui Components Available
The following shadcn/ui components are already set up and ready to use:
- Button
- Card
- Input
- Label
- Textarea
- Dialog
- Select
- Badge
- Switch
- And more...

When adding new components, always use the shadcn CLI rather than creating custom components from scratch.
