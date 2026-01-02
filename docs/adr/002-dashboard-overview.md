# ADR 002: Dashboard Overview Implementation

## Status
Accepted

## Context
We needed to create a comprehensive dashboard overview page (`/dashboard`) that serves as the central hub for mentors to manage their booking platform. This page should provide quick insights into their mentoring business while offering easy access to key actions.

## Decision
We implemented a dashboard overview page using TanStack Start's file-based routing with a card-based layout showcasing key metrics and quick actions.

### Implementation Details

**Routing Structure:**
- Used file-based routing at `src/routes/dashboard.tsx`
- Protected route with existing `authMiddleware`
- Clean navigation back to login if not authenticated

**UI Layout:**
- Responsive grid system using Tailwind CSS
- Dark theme (gray-900 background) consistent with landing page
- Card-based components from shadcn/ui for visual hierarchy
- Lucide React icons for visual indicators

**Component Structure:**
1. **Header Section**: Page title, description, and action buttons
2. **Stats Cards**: 4-column grid displaying key metrics
   - Total Sessions (all booking sessions)
   - Total Revenue (from paid sessions in USDC)
   - Completed Sessions
   - Pending Bookings
3. **Booking Sessions List**: Section to display user's active sessions
4. **Quick Actions**: Two-column grid with Profile Management and Danger Zone links

**Navigation:**
- "Update Profile" button → `/dashboard/update-profile`
- "Create Booking" button → `/dashboard/create-booking`
- Profile Management card → `/dashboard/update-profile`
- Danger Zone card → `/dashboard/danger-zone`

**Data Handling:**
- Mock data structure prepared for real database integration
- Statistics object ready to be populated from queries
- Empty state handling for new users with no sessions

## Consequences

### Positive
- ✅ Clean, intuitive interface matching platform's design system
- ✅ Mobile-responsive layout using Tailwind's grid system
- ✅ Quick access to all major dashboard functions
- ✅ Visual hierarchy guides user attention to key metrics
- ✅ Empty state encourages users to create first booking session
- ✅ Consistent with existing authentication and routing patterns

### Neutral
- ⚠️ Currently uses mock data (database integration pending)
- ⚠️ Stats calculation logic needs to be implemented
- ⚠️ No real-time updates or live data refresh

### Future Considerations
- Add data fetching with TanStack Query
- Implement real-time updates for booking status changes
- Add filtering and sorting for booking sessions list
- Include revenue charts and graphs
- Add notifications for new bookings
- Consider adding export functionality for analytics
- Add quick edit capabilities directly from the list

## Technical Implementation

### Dependencies Used
```typescript
- @tanstack/react-router (Link, navigation)
- @/components/ui/card (Card, CardHeader, CardTitle, CardDescription, CardContent)
- @/components/ui/button (Button with variants)
- @/components/ui/badge (Badge for status indicators)
- lucide-react (Calendar, DollarSign, Users, Clock icons)
```

### State Management
- Local component state for mock data
- Ready for TanStack Query integration
- Prepared for real-time updates via React Query's query invalidation

### Accessibility
- Semantic HTML structure
- Proper heading hierarchy (h1, h2, h3)
- Color contrast meeting WCAG standards
- Keyboard navigation support
- Screen reader friendly labels

## References
- [TanStack Router Documentation](https://tanstack.com/router)
- [shadcn/ui Card Component](https://ui.shadcn.com/docs/components/card)
- [Tailwind CSS Grid Documentation](https://tailwindcss.com/docs/grid)
