# ADR 006: Booking Update Implementation

## Status
Accepted

## Context
Mentors need the ability to edit existing booking sessions and manage their lifecycle. This includes updating session details, changing pricing, toggling active status, and safely deleting sessions with proper warnings.

## Decision
We implemented a comprehensive booking update page (`/dashboard/update-booking/$bookingId`) that combines edit functionality with lifecycle management, including session status toggling and deletion with confirmation.

### Implementation Details

**Routing Structure:**
- File-based routing at `src/routes/dashboard.update-booking.$bookingId.tsx`
- Dynamic route parameter: `$bookingId`
- Protected route with `authMiddleware`
- Breadcrumb navigation with back button

**URL Parameter Handling:**
- Uses TanStack Router's `useParams` hook
- Extracts `bookingId` from URL
- Ready for data fetching based on ID

**Feature Set:**
1. **Session Status Toggle**: Enable/disable booking availability
2. **Edit All Session Details**: Same fields as create page
3. **Delete Session**: Danger zone with confirmation dialog

**Status Management:**
- Active/Inactive toggle using Switch component
- When inactive, mentees cannot book new sessions
- Existing bookings remain unaffected
- Visual feedback on current state

**Edit Functionality:**
- Pre-populated form with existing session data
- Same form structure as create page
- Conditional payment configuration
- Form validation and submission

**Delete Confirmation:**
- Separate danger zone section at bottom
- Confirmation dialog with exact text match
- "DELETE" must be typed to confirm
- Loading state during deletion

**Pre-filled Data Example:**
```typescript
const [formData, setFormData] = useState({
  title: '1:1 Career Guidance Session',
  description: 'Get personalized career advice...',
  type: 'PAID',
  token: 'USDC',
  price: '50.000000',
  duration: '30',
  timeBreak: '5',
})
```

**State Management:**
- `formData`: Session details
- `showDeleteDialog`: Delete confirmation visibility
- `confirmationText`: User's deletion confirmation input
- `isDeleting`: Loading state
- `isActive`: Session status toggle

## Consequences

### Positive
- ✅ Comprehensive editing capabilities
- ✅ Status toggle provides session lifecycle control
- ✅ Pre-filled forms improve UX
- ✅ Delete confirmation prevents accidental removal
- ✅ Consistent UI with create page
- ✅ Route parameter enables direct linking
- ✅ Loading states provide clear feedback
- ✅ Disabled states prevent invalid actions

### Neutral
- ⚠️ No versioning/history of changes
- ⚠️ No notification to existing bookings on changes
- ⚠️ No bulk edit capabilities
- ⚠️ No cloning/duplicating sessions
- ⚠️ No change impact analysis

### Future Considerations
- Add session versioning/change history
- Notify mentees of session changes
- Implement session cloning
- Add bulk operations for multiple sessions
- Add change impact warnings (e.g., "3 bookings will be affected")
- Implement A/B testing for session variations
- Add session analytics and performance metrics
- Support for partial booking cancellations
- Automatic inactive status for sessions with no recent bookings
- Smart contract updates for active bookings

## Technical Implementation

### Dependencies Used
```typescript
- react (useState hook)
- @tanstack/react-router (useParams, Link, navigation)
- @/components/ui/card (Card, CardHeader, CardTitle, CardDescription, CardContent)
- @/components/ui/button (Button with variants)
- @/components/ui/input (Input component)
- @/components/ui/label (Label component)
- @/components/ui/textarea (Textarea component)
- @/components/ui/select (Select, SelectContent, SelectItem, SelectTrigger, SelectValue)
- @/components/ui/badge (Badge for token display)
- @/components/ui/switch (Switch for active status)
- @/components/ui/dialog (Dialog, DialogContent, etc.)
- @/lib/constants (BOOKING_TYPES, TOKEN_TYPES, SESSION_DURATIONS, TIME_BREAKS)
- lucide-react (ArrowLeft, DollarSign, Gift, CreditCard, Coins, AlertTriangle icons)
```

### Parameter Extraction
```typescript
const { bookingId } = Route.useParams()
```

### Form Submission
```typescript
const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault()
  // TODO: Implement update in database
  console.log('Updating booking session:', formData)
}
```

### Delete Confirmation Logic
```typescript
const handleConfirmDelete = async () => {
  if (confirmationText !== 'DELETE') {
    alert('Please type "DELETE" to confirm')
    return
  }

  setIsDeleting(true)
  // TODO: Implement booking deletion
  console.log('Deleting booking session:', bookingId)
  await new Promise(resolve => setTimeout(resolve, 1000))
  setIsDeleting(false)
  setShowDeleteDialog(false)
}
```

## Database Integration

### Schema Mapping
Update operation maps to `booking_session` table:
```typescript
{
  id: bookingId,
  title: formData.title,
  description: formData.description,
  type: formData.type,
  token: formData.token,
  price: formData.price,
  duration: parseInt(formData.duration),
  timeBreak: parseInt(formData.timeBreak),
  isActive: isActive,
  updatedAt: new Date(),
}
```

### Future API Implementation
```typescript
const handleSubmit = async (data) => {
  const session = await updateBookingSession(bookingId, {
    ...data,
    isActive,
  })
  router.navigate('/dashboard')
}

const handleDelete = async () => {
  await deleteBookingSession(bookingId)
  router.navigate('/dashboard')
}
```

### Data Loading (Future Enhancement)
```typescript
useEffect(() => {
  const loadSession = async () => {
    const session = await fetchBookingSession(bookingId)
    setFormData({
      title: session.title,
      description: session.description,
      type: session.type,
      token: session.token,
      price: session.price,
      duration: session.duration.toString(),
      timeBreak: session.timeBreak.toString(),
    })
    setIsActive(session.isActive)
  }
  loadSession()
}, [bookingId])
```

## Change Management Considerations

### Backward Compatibility
- Existing bookings should not be affected by session updates
- Price changes only apply to new bookings
- Duration changes may need mentee confirmation
- Type changes require careful handling

### Impact Analysis (Future)
Before allowing destructive changes:
1. Check for pending bookings
2. Warn about impact on existing bookings
3. Offer alternative actions (create new session instead)
4. Require additional confirmation for high-impact changes

### Versioning Strategy (Future)
```typescript
booking_session_versions: {
  id: string,
  bookingSessionId: string,
  version: number,
  title: string,
  description: string,
  type: string,
  token: string,
  price: string,
  duration: number,
  timeBreak: number,
  changedBy: string,
  changedAt: timestamp,
  changeReason: string,
}
```

## Security Considerations

### Authorization
- Verify user owns the session before allowing updates
- Check mentor_id matches current user's mentor profile
- Return 403 if unauthorized

### Input Validation
- Validate all fields server-side
- Prevent price manipulation
- Ensure token type is supported
- Validate duration/timeBreak ranges

### Audit Trail
- Log all changes with user ID and timestamp
- Track what was changed and when
- Store old values for rollback capability

## Smart Contract Implications

### Price Changes
- Cannot retroactively change prices for paid bookings
- New bookings use updated price
- Commitment fees locked at booking time

### Session Type Changes
- Cannot change type if active bookings exist
- May require smart contract interaction
- Consider refund implications for commitment fees

### Deletion
- Cannot delete if active bookings exist
- May need to handle automatic refunds
- Smart contract integration required

## Accessibility Features
- Proper label associations
- Required field indicators
- Clear section headings
- Keyboard navigation support
- High contrast warning colors
- Screen reader announcements for dialog state
- Focus management in confirmation dialog

## References
- [TanStack Router Parameters](https://tanstack.com/router/guide/params)
- [Radix UI Switch](https://www.radix-ui.com/docs/primitives/components/switch)
- [React useState Best Practices](https://react.dev/reference/react/useState)
- [CRUD Operations Patterns](https://web.dev/learn/forms/server-processing/)
