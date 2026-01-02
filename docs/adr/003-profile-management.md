# ADR 003: Profile Management Implementation

## Status
Accepted

## Context
Mentors need a dedicated page to manage their profile information including name, bio, professional field, and timezone. This information helps mentees understand the mentor's expertise and availability.

## Decision
We implemented a profile management page (`/dashboard/update-profile`) with a comprehensive form using controlled inputs and a clean, accessible layout.

### Implementation Details

**Routing Structure:**
- File-based routing at `src/routes/dashboard.update-profile.tsx`
- Protected route with `authMiddleware`
- Breadcrumb navigation with back button to dashboard

**Form Design:**
- Single-column layout with proper spacing
- All form fields use controlled components
- Real-time validation and character counting
- Required field indicators
- Consistent styling with dark theme

**Form Fields:**
1. Username: Text input for username
2. **Name**: Text input for full name
3. **Bio**: Textarea with 500 character limit counter
4. **Professional Field**: Dropdown select from predefined list
5. **Timezone**: Text input with auto-detection from browser

**Data Handling:**
- Local state management with `useState`
- Form data object structure matching database schema
- Input change handlers for controlled components
- Form submission handler (ready for API integration)
- Auto-detection of timezone using `Intl.DateTimeFormat()`

**Professional Fields:**
- 31 predefined fields covering digital/tech professions
- Includes Software Engineering, AI/ML, Blockchain, Design, Marketing, etc.
- Stored as constants in `/lib/constants.ts`
- Easy to extend in the future

**Navigation:**
- Back button returns to `/dashboard`
- Cancel button returns to `/dashboard`
- Save button submits form (currently logs to console)

## Consequences

### Positive
- ✅ Clean, focused form layout
- ✅ Auto-detection of user's timezone improves UX
- ✅ Character counter for bio field
- ✅ Professional field dropdown prevents typos/inconsistencies
- ✅ Easy navigation with breadcrumb-style back button
- ✅ Consistent with dashboard design system
- ✅ Responsive design for mobile devices

### Neutral
- ⚠️ No image upload for profile picture (future enhancement)
- ⚠️ No multi-language support for timezone names
- ⚠️ Form validation is minimal (browser native only)
- ⚠️ No optimistic UI updates (handled by React Query)

### Backend Consequences
- ✅ Type-safe database operations with Drizzle ORM
- ✅ Server-side authentication via better-auth middleware
- ✅ Efficient database queries with proper indexing
- ✅ RESTful API design with file-based routing
- ✅ Client-side caching with TanStack Query
- ✅ Automatic cache invalidation on updates
- ⚠️ No rate limiting on API endpoints (consider for production)
- ⚠️ No request validation schema (consider Zod for validation)

### Backend Implementation

### Service Layer (`src/lib/server/profile-service.ts`)
The backend service layer provides database operations for mentor profiles:

- **getProfile(userId)**: Fetches mentor profile by user ID
- **upsertProfile(userId, data)**: Creates or updates mentor profile using Drizzle's `onConflictDoUpdate`
- **getCurrentUserId()**: Extracts user ID from authenticated session via better-auth

**Key Features:**
- Type-safe operations using Drizzle ORM
- Automatic `updatedAt` timestamp management
- Cascade deletion support via foreign key constraints
- Secure user context via request headers

### API Routes (`src/routes/api.profile.ts`)
File-based routing using TanStack React Router:

**PUT /api/profile**
- Updates mentor profile with authentication middleware
- Receives JSON payload with profile data
- Uses upsert operation to create or update
- Returns updated profile data
- Uses `handlers` pattern for mutations
- Middleware applied at server level, not inside handlers

### Database Integration
- **Table**: `mentor_profile` (PostgreSQL)
- **ORM**: Drizzle with Neon serverless driver
- **Relations**: One-to-one with `user` table
- **Indexes**: Optimized with `userId` index

### Query Layer (`src/queries/use-profile.ts`)
TanStack Query hooks for client-side data management:

**useUpdateProfile()**
- Mutation for profile updates via PUT `/api/profile`
- Invalidates `['profile']` query on success
- Provides optimistic updates support
- Only used for mutations, not data fetching

### Frontend Integration (`src/routes/dashboard/update-profile.tsx`)
Enhanced with backend connectivity:

- **Server-side Loading**: Uses `loader` pattern for initial data fetching
- **Error Component**: Dedicated error boundary component
- **Form Pre-population**: Loads existing profile data via `useLoaderData()`
- **Success Feedback**: Toast notification on successful update
- **Auto-navigation**: Redirects to dashboard after save
- **Loading Button**: Disabled state during submission
- **No Client-side Queries**: Data fetched server-side, mutations client-side

**Data Flow:**
1. Route loads → `loader` fetches profile server-side
2. Profile loaded → Form fields populated from loader data
3. User submits → `useUpdateProfile()` mutation via API route
4. Success → Toast + Navigate to dashboard
5. API route uses `handlers` pattern for PUT operations

## Future Considerations
- Add profile picture upload functionality
- Implement real-time validation with Zod
- Add profile preview mode
- Include social media links
- Add availability calendar integration
- Implement SEO-friendly profile pages
- Add profile completion percentage indicator
- Support for multiple languages
- Add rich text editing for bio field
- Implement image compression for uploaded photos

## Technical Implementation

### Dependencies Used
```typescript
Frontend:
- react (useState hook)
- @tanstack/react-router (Link, useRouter, useLoaderData, navigation)
- @tanstack/react-query (useMutation only)
- @/components/ui/card (Card, CardHeader, CardTitle, CardDescription, CardContent)
- @/components/ui/button (Button with variants)
- @/components/ui/input (Input component)
- @/components/ui/label (Label component)
- @/components/ui/textarea (Textarea component)
- @/components/ui/select (Select, SelectContent, SelectItem, SelectTrigger, SelectValue)
- @/lib/constants (PROFESSIONAL_FIELDS)
- @/queries/use-profile (useUpdateProfile hook)
- lucide-react (ArrowLeft icon)
- sonner (toast notifications)
- @/lib/server/profile-service (server-side functions)

Backend:
- drizzle-orm (database ORM)
- @tanstack/react-start (server utilities, getRequestHeaders)
- better-auth (authentication)
```

### Form Validation Strategy
- HTML5 validation attributes (`required`)
- Type-specific inputs (text, number, etc.)
- Client-side character counting for bio
- Ready for Zod schema validation integration

### Accessibility Features
- Proper label associations with `htmlFor` attribute
- Required fields marked with `required` attribute
- Clear error messaging ready for implementation
- Keyboard navigation support
- Screen reader compatible structure

### State Management
```typescript
// Server-side data loading
loader: async () => {
  const userId = await getCurrentUserId()
  const profile = await getProfile(userId)
  return { profile }
}

// Client-side form state
const [formData, setFormData] = useState({
  name: profile?.name || '',
  bio: profile?.bio || '',
  professionalField: profile?.professionalField || '',
  timezone: profile?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
})
```

## References
- [React Controlled Components](https://react.dev/reference/react/useState)
- [HTML5 Form Validation](https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/HTML5/Constraint_validation)
- [Intl.DateTimeFormat API](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat)
