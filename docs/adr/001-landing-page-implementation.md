# ADR 001: Landing Page Implementation

## Status
Accepted

## Context
We needed to create a landing page for NoCal Platform, a booking platform similar to Cal.com and Calendly, but with a unique third booking schema: "free but with commitment fee" powered by blockchain smart contracts.

## Decision
We implemented a landing page using TanStack Start's file-based routing with shadcn/ui components and Tailwind CSS for styling.

### Implementation Details

**Framework Choice:**
- Used existing TanStack Start framework with file-based routing (`src/routes/index.tsx`)
- Leveraged React Router's Link component for navigation to `/dashboard`

**UI Components:**
- Added shadcn/ui components via CLI: `Card`, `Badge`, `Separator`
- Used existing `Button` component from shadcn/ui
- Used Lucide React icons for visual elements

**Design System:**
- Maintained dark theme consistency (gray-900 background)
- Used Tailwind CSS for responsive design
- Implemented gradient text effects for hero section
- Used semantic HTML with proper sectioning

**Content Structure:**
1. **Hero Section**: Brand name, value proposition, CTA to dashboard
2. **"Why?" Section**: Three-column layout explaining commitment-based booking benefits
3. **Pricing Section**: Three-card layout showcasing the three booking types
4. **Quote Section**: Walt Disney quote about action and time appreciation

## Consequences

### Positive
- ✅ Consistent with existing codebase architecture
- ✅ No custom components needed - only shadcn/ui
- ✅ Responsive design works across devices
- ✅ Fast development using file-based routing
- ✅ Dark theme maintained throughout
- ✅ Clear value proposition communicated

### Neutral
- ⚠️ Landing page content is static (no CMS integration yet)
- ⚠️ No A/B testing capability built-in

### Future Considerations
- Consider adding analytics tracking for CTA clicks
- Potential for internationalization (i18n) if needed
- Could add testimonial section in the future
- May want to integrate with marketing tools

## Technical Implementation

### Components Used
```typescript
- Button (from @/components/ui/button)
- Card, CardHeader, CardTitle, CardDescription, CardContent (from @/components/ui/card)
- Badge (from @/components/ui/badge)
- Separator (from @/components/ui/separator)
- Link (from @tanstack/react-router)
- Lucide React icons (Calendar, CheckCircle, DollarSign, Users)
```

### Routing
- Landing page served at `/` via `src/routes/index.tsx`
- CTA button navigates to `/dashboard` route (authentication handled by existing logic)

### Responsive Design
- Used Tailwind's responsive prefixes (md:, lg:)
- Mobile-first approach with scaling for larger screens
- Grid layouts adapt from single column to multi-column

## References
- [TanStack Start Documentation](https://tanstack.com/start)
- [shadcn/ui Documentation](https://ui.shadcn.com)
- [Tailwind CSS Documentation](https://tailwindcss.com)
