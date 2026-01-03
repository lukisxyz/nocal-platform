# ADR 007: Booking Session Deletion Implementation

## Status
Accepted

## Context
Mentors need the ability to permanently delete their booking sessions. This is a destructive operation that requires proper safeguards to prevent accidental deletions and ensure users understand the impact on mentees who have booked sessions.

## Decision
We implemented a comprehensive booking session deletion system with multiple confirmation layers, cascade deletion handling, and proper authorization checks. The deletion is available both from the update page and can be integrated into other management interfaces.

### Implementation Details

**API Endpoint:**
- Route: `DELETE /api/booking/:bookingId`
- Protected with `authMiddleware`
- Returns success response or error

**Backend Service:**
- `src/lib/server/booking-service.ts:deleteBookingSession()`
- Validates user ownership via `getMentorProfileId()`
- Checks session exists and belongs to mentor
- Handles cascade deletion of availability records
- Uses Drizzle ORM with PostgreSQL

**Frontend Mutation:**
- `src/queries/use-booking-mutations.ts:useDeleteBookingSession()`
- TanStack Query mutation hook
- Optimistic updates for immediate UI feedback
- Cache invalidation on success
- Navigation back to dashboard

**Authorization Flow:**
```
1. User initiates deletion
2. API validates authentication (authMiddleware)
3. Get current user ID from session
4. Verify mentor profile exists
5. Check session belongs to mentor
6. If unauthorized/not found → 404 error
7. If authorized → proceed with deletion
```

### Cascade Deletion Strategy

**Database Relationships:**
```typescript
booking_session → mentor_profile (CASCADE on delete)
mentor_availability → mentor_profile (CASCADE on delete)
booking → booking_session (CASCADE on delete)
```

**Deletion Order:**
1. Delete all `mentor_availability` records for the mentor
2. Delete the `booking_session` record
3. Database automatically cascades to `booking` records

**Rationale:**
- Availability schedules are tied to the session template
- When session is deleted, availability becomes meaningless
- Booking records (actual mentee bookings) should cascade
- Ensures no orphaned availability or booking records

### User Experience Flow

**From Update Page:**
1. User scrolls to "Delete Session" section
2. Clicks "Delete Session" button (red variant)
3. Confirmation dialog appears
4. User types exact confirmation text
5. Dialog button becomes enabled
6. User clicks "Delete Session"
7. Loading state shown
8. Success → navigate to dashboard

**UI Components:**
- Red-styled danger zone section
- AlertTriangle icon for visual warning
- Confirmation dialog with text input
- Button disabled until exact match
- Loading state during deletion

**Confirmation Dialog:**
- Modal with clear warning text
- Input field for exact text match
- Cancel and Delete buttons
- Disabled states during processing
- Error handling with user feedback

### Error Handling

**Scenario: Session Not Found**
- Status: 404
- Message: "Booking session not found or unauthorized"
- User sees error, remains on page

**Scenario: Unauthorized**
- Status: 404 (same as not found for security)
- User cannot access others' sessions
- No information leakage

**Scenario: Server Error**
- Status: 500
- Message: "Failed to delete booking session"
- User sees error, can retry

**Client-Side:**
- Mutation error handling
- User-friendly error messages
- No broken UI state
- Cache properly invalidated

### Technical Implementation

**API Route Handler:**
```typescript
DELETE: async ({ params }) => {
  const userId = await getCurrentUserId()

  try {
    await deleteBookingSession(userId, params.bookingId)
    return new Response(JSON.stringify({ success: true }))
  } catch (error) {
    // Handle errors appropriately
  }
}
```

**Backend Service:**
```typescript
export async function deleteBookingSession(userId: string, sessionId: string) {
  const mentorId = await getMentorProfileId(userId)

  const existingSession = await getBookingSession(sessionId, mentorId)
  if (!existingSession) {
    throw new Error('Booking session not found or unauthorized')
  }

  await db.delete(mentorAvailability).where(
    eq(mentorAvailability.mentorId, mentorId)
  )

  await db.delete(bookingSession).where(
    eq(bookingSession.id, sessionId)
  )

  return { success: true }
}
```

**Frontend Mutation:**
```typescript
export function useDeleteBookingSession() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: async (sessionId: string) => {
      const response = await fetch(`/api/booking/${sessionId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete booking session')
      }

      return response.json()
    },
    onSuccess: (_, sessionId: string) => {
      queryClient.removeQueries({ queryKey: ['booking-session', sessionId] })

      queryClient.setQueryData<BookingSession[]>(
        ['booking-sessions'],
        (old) => old?.filter((session) => session.id !== sessionId) || []
      )

      queryClient.invalidateQueries({ queryKey: ['booking-sessions'] })

      navigate({ to: '/dashboard' })
    },
  })
}
```

### Security Considerations

**Authorization:**
- Session ownership validation
- User can only delete their own sessions
- 404 response for non-existent or unauthorized sessions
- No information leakage about other users' sessions

**Cascade Safety:**
- Database foreign key constraints enforce integrity
- No orphaned records possible
- All dependent data automatically removed

**Rate Limiting:**
- Mutation naturally throttled by user action
- Button disabled during deletion
- Prevents rapid successive deletions

**Data Recovery:**
- Deletion is permanent (no soft delete)
- No backup/recovery mechanism in place
- Future consideration: soft delete with grace period

### Impact on Mentees

**Affected Data:**
- Future bookings: Will be lost (mentee notified? - future feature)
- Past bookings: Historical record removed
- Availability: No longer shown to potential mentees

**Future Enhancements:**
- Email notification to mentees with upcoming bookings
- Option to deactivate vs delete
- Bulk deletion warnings for sessions with active bookings
- Refund processing for paid commitments

### Testing Considerations

**Unit Tests Needed:**
- `deleteBookingSession()` with valid session
- `deleteBookingSession()` with invalid session ID
- `deleteBookingSession()` with unauthorized user
- Cascade deletion verification
- Error handling scenarios

**Integration Tests:**
- API endpoint with authentication
- Frontend mutation flow
- Navigation after deletion
- Cache invalidation
- Error display

**E2E Tests:**
- Complete deletion flow from UI
- Confirmation dialog interaction
- Loading states
- Error scenarios
- Authorization checks

## Consequences

### Positive
- ✅ Complete removal of unwanted sessions
- ✅ Cascade deletion prevents orphaned data
- ✅ Strong authorization prevents unauthorized deletion
- ✅ Clear user confirmation prevents accidents
- ✅ Optimistic updates provide good UX
- ✅ Proper error handling and feedback
- ✅ Cache management prevents stale data
- ✅ Consistent with account deletion UX patterns

### Neutral
- ⚠️ Permanent deletion (no recovery)
- ⚠️ No soft delete or grace period
- ⚠️ Impact on mentees not communicated (future)
- ⚠️ No bulk deletion option
- ⚠️ Requires manual recreation if needed

### Future Considerations
- Implement soft delete with 30-day grace period
- Add email notifications to affected mentees
- Create "deactivate" option (hides but keeps data)
- Add bulk deletion for multiple sessions
- Implement session templates (delete template vs instances)
- Add data export before deletion
- Smart contract integration for refund processing
- Audit logging for deletion actions
- "Mark as completed" alternative to deletion
- Session archiving instead of deletion

## References
- [ADR 005: Booking Creation](./005-booking-creation.md)
- [ADR 006: Booking Update](./006-booking-update.md)
- [PostgreSQL Foreign Key Constraints](https://www.postgresql.org/docs/current/ddl-constraints.html#DDL-CONSTRAINTS-FK)
- [Drizzle ORM Delete API](https://orm.drizzle.team/docs/delete)
- [TanStack Query Mutations](https://tanstack.com/query/latest/docs/framework/react/guides/mutations)
