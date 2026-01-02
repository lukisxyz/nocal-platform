# ADR 004: Danger Zone Implementation

## Status
Accepted

## Context
We needed a secure page for destructive actions, specifically account deletion. This is a critical feature that requires multiple safeguards to prevent accidental deletions and ensure users understand the consequences of their actions.

## Decision
We implemented a dedicated danger zone page (`/dashboard/danger-zone`) with multiple confirmation layers, clear warnings, and a confirmation dialog requiring exact text input.

### Implementation Details

**Routing Structure:**
- File-based routing at `src/routes/dashboard.danger-zone.tsx`
- Protected route with `authMiddleware`
- Breadcrumb navigation with back button

**Security Features:**
1. **Landing Page Warning**: Detailed list of what will be deleted
2. **Additional Warnings**: Important notes about irreversibility
3. **Confirmation Dialog**: Modal requiring exact text match
4. **Text Match Validation**: User must type "I delete this account" exactly

**UI Components:**
- Red-accented warning styling (red-900/50 border, red-500 icons)
- AlertTriangle icon for visual warning
- Multiple information boxes with different warning levels
- Disabled button state during deletion process

**Information Architecture:**
1. **Primary Warning Box** (red background):
   - Complete list of data that will be deleted
   - Mentor profile, sessions, bookings, wallet addresses, etc.

2. **Secondary Warning Box** (yellow background):
   - Important notes about consequences
   - Impact on mentees, payment implications

3. **Delete Button**:
   - Destructive variant (red background)
   - Shows loading state during deletion
   - Disabled during process

**Confirmation Dialog:**
- Uses Radix UI Dialog component
- Displays exact text to type
- Input field with real-time validation
- Button disabled until exact match
- Loading state during deletion

**State Management:**
- `showDeleteDialog`: Controls dialog visibility
- `confirmationText`: Tracks user input
- `isDeleting`: Manages loading state
- Button disabled states based on conditions

## Consequences

### Positive
- ✅ Multiple confirmation layers prevent accidental deletion
- ✅ Clear, detailed warnings about consequences
- ✅ Visual hierarchy using color coding (red/yellow boxes)
- ✅ Exact text match prevents accidental clicks
- ✅ Loading states provide clear feedback
- ✅ Disabled states prevent multiple simultaneous deletions
- ✅ Consistent with industry best practices (GitHub, etc.)
- ✅ Accessible with proper ARIA labels

### Neutral
- ⚠️ No "soft delete" or grace period option
- ⚠️ No data export feature before deletion
- ⚠️ Deletion is permanent with no recovery mechanism
- ⚠️ No notification sent to mentees (future enhancement)

### Future Considerations
- Add data export feature (JSON, CSV)
- Implement soft delete with 30-day grace period
- Send email notifications to mentees with upcoming bookings
- Add backup/recovery mechanism
- Require additional authentication (password/MFA)
- Log deletion actions for audit trail
- Add "delete all data" vs "deactivate account" options
- Implement account merging for duplicate accounts

## Technical Implementation

### Dependencies Used
```typescript
- react (useState hook)
- @tanstack/react-router (Link, navigation)
- @/components/ui/card (Card, CardContent, CardDescription, CardHeader, CardTitle)
- @/components/ui/button (Button with variants)
- @/components/ui/input (Input component)
- @/components/ui/dialog (Dialog, DialogPortal, DialogOverlay, etc.)
- lucide-react (ArrowLeft, AlertTriangle icons)
```

### State Flow
```typescript
const [showDeleteDialog, setShowDeleteDialog] = useState(false)
const [confirmationText, setConfirmationText] = useState('')
const [isDeleting, setIsDeleting] = useState(false)
```

### Confirmation Logic
```typescript
const handleConfirmDelete = async () => {
  if (confirmationText !== 'I delete this account') {
    alert('Please type "I delete this account" to confirm')
    return
  }

  setIsDeleting(true)
  // TODO: Implement account deletion
  await deleteAccount()
  setIsDeleting(false)
  setShowDeleteDialog(false)
}
```

### Button Disabled Conditions
```typescript
<Button
  variant="destructive"
  onClick={handleDeleteClick}
  disabled={isDeleting}
>
  {isDeleting ? 'Deleting...' : 'Delete My Account'}
</Button>
```

## Security Considerations

### Current Implementation
- Double confirmation (button click + text input)
- Exact text match validation
- Loading state prevents multiple attempts
- Clear visual warnings

### Future Enhancements Needed
1. **Authentication Verification**: Require password or signature
2. **Session Revocation**: Invalidate all active sessions
3. **Data Sanitization**: Ensure complete data removal
4. **Audit Logging**: Log deletion event with timestamp and user ID
5. **Backup Verification**: Ensure backups are also purged

## Accessibility Features
- Proper heading hierarchy
- High contrast color scheme for warnings
- Screen reader announcements for dialog state
- Keyboard navigation support
- Focus management in dialog
- ARIA labels for warning icons

## Database Deletion Strategy

### Cascade Deletion Order
When account is deleted, the following should occur in order:
1. Delete all `booking` records (cascades from mentor_profile)
2. Delete all `booking_session` records (cascades from mentor_profile)
3. Delete `mentor_profile` record
4. Delete all `session` records (cascades from user)
5. Delete all `account` records (cascades from user)
6. Delete all `wallet_address` records (cascades from user)
7. Delete `user` record

### Smart Contract Considerations
For commitment-based bookings:
- Check if any active commitments exist
- Either:
  - Prevent deletion until commitments are resolved, OR
  - Implement automatic refund mechanism via smart contract

## References
- [Radix UI Dialog](https://www.radix-ui.com/docs/primitives/components/dialog)
- [OWASP Secure Delete Guidelines](https://owasp.org/www-community/controls/Secure_Delete_Control)
- [GDPR Right to Erasure](https://gdpr.eu/right-to-be-forgotten/)
