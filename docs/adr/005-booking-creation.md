# ADR 005: Booking Creation Implementation

## Status
Accepted

## Context
Mentors need to create different types of booking sessions (Free, Paid, Commitment Fee) with configurable details including duration, time breaks, pricing, and token selection. The page should guide users through the process with clear options and validation.

## Decision
We implemented a comprehensive booking creation page (`/dashboard/create-booking`) with a multi-section form, dynamic payment configuration, and intuitive booking type selection.

### Implementation Details

**Routing Structure:**
- File-based routing at `src/routes/dashboard.create-booking.tsx`
- Protected route with `authMiddleware`
- Breadcrumb navigation with back button

**Form Architecture:**
The form is organized into logical sections:
1. Booking Type Selection (visual card-based selection)
2. Session Details (title, description, duration, time break)
3. Payment Configuration (conditional, only for paid types)
4. Submit Actions

**Booking Type Selection:**
- Three visual cards for FREE, PAID, and COMMITMENT types
- Icon-based visual identification:
  - FREE: Gift icon (blue theme)
  - PAID: DollarSign icon (green theme)
  - COMMITMENT: CreditCard icon (purple theme)
- Visual feedback on selection (border color changes)
- Interactive button cards (not radio buttons for better UX)

**Dynamic Payment Configuration:**
- Conditionally rendered based on booking type
- Only shows for PAID and COMMITMENT types
- Two fields:
  1. Token Selection (USDC, USDT, mockUSDC, mockUSDT)
  2. Price Amount (6 decimal precision for crypto)
- Helpful description text for commitment fees

**Session Configuration:**
- Title: Text input for session name
- Description: Textarea for detailed description
- Duration: Dropdown (15, 30, 45 minutes)
- Time Break: Dropdown (multiples of 5, from 5-60 minutes)

**State Management:**
```typescript
const [formData, setFormData] = useState({
  title: '',
  description: '',
  type: '',       // 'FREE' | 'PAID' | 'COMMITMENT'
  token: '',      // Token type
  price: '',      // Price as string
  duration: '',   // Duration in minutes
  timeBreak: '',  // Time break in minutes
})
```

**Form Validation:**
- Required field validation
- Price validation for paid types (decimal precision)
- Token selection required for paid types
- Submit button disabled until type is selected

**Visual Design:**
- Card-based layout for each section
- Consistent dark theme (gray-800, gray-700)
- Badge component for token display
- Color-coded booking type cards
- Clear section headers and descriptions

## Consequences

### Positive
- ✅ Intuitive booking type selection with visual feedback
- ✅ Dynamic form adapts to user's choices
- ✅ Clear separation of concerns (details vs payment)
- ✅ Crypto-aware pricing with 6-decimal precision
- ✅ Flexible time configurations (duration + breaks)
- ✅ Consistent with platform design system
- ✅ Responsive layout for mobile devices
- ✅ Helpful contextual information

### Neutral
- ⚠️ No integration with payment smart contracts yet
- ⚠️ No template system for common session types
- ⚠️ No bulk creation capabilities

### Future Considerations
- Implement smart contract interaction for payments
- Add session templates for common use cases
- Support for recurring sessions
- Add group/team booking options
- Implement session categories/tags
- Add attachments/Resources section
- Support for custom booking forms
- Integration with video conferencing tools
- Add cancellation policy configuration
- Implement automatic scheduling rules
- Bulk availability editing (copy one day to another)
- Timezone awareness
- Holiday/blackout dates

## Technical Implementation

### Dependencies Used
```typescript
- react (useState hook)
- @tanstack/react-router (Link, navigation)
- @/components/ui/card (Card, CardHeader, CardTitle, CardDescription, CardContent)
- @/components/ui/button (Button with variants)
- @/components/ui/input (Input component)
- @/components/ui/label (Label component)
- @/components/ui/textarea (Textarea component)
- @/components/ui/select (Select, SelectContent, SelectItem, SelectTrigger, SelectValue)
- @/components/ui/badge (Badge for token display)
- @/lib/constants (BOOKING_TYPES, TOKEN_TYPES, SESSION_DURATIONS, TIME_BREAKS)
- lucide-react (ArrowLeft, DollarSign, Gift, CreditCard, Coins icons)
```

### Constants Reference
```typescript
// Booking Types
BOOKING_TYPES = { FREE: 'FREE', PAID: 'PAID', COMMITMENT: 'COMMITMENT' }

// Token Types
TOKEN_TYPES = { USDC: 'USDC', USDT: 'USDT', MOCK_USDC: 'mockUSDC', MOCK_USDT: 'mockUSDT' }

// Session Durations
SESSION_DURATIONS = [15, 30, 45]

// Time Breaks
TIME_BREAKS = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60]
```

### Form Submission
```typescript
const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault()
  // TODO: Implement save to database
  console.log('Creating booking session:', formData)
}
```

### Input Change Handling
```typescript
const handleInputChange = (field: string, value: string) => {
  setFormData(prev => ({ ...prev, [field]: value }))
}
```

## Database Integration

### Schema Mapping
The form data maps directly to the `booking_session` table:
```typescript
{
  title: formData.title,
  description: formData.description,
  type: formData.type,           // 'FREE' | 'PAID' | 'COMMITMENT'
  token: formData.token || null, // null for FREE
  price: formData.price || null, // null for FREE
  duration: parseInt(formData.duration),
  timeBreak: parseInt(formData.timeBreak),
  isActive: true,
  mentorId: /* current user's mentor profile ID */
}
```

### Future API Implementation
```typescript
const handleSubmit = async (data) => {
  const session = await createBookingSession({
    ...data,
    mentorId: await getCurrentMentorProfileId(),
  })
  router.navigate('/dashboard')
}
```

## Blockchain Integration Notes

### Payment Flow (Future)
For PAID and COMMITMENT types:
1. Generate smart contract interaction
2. Request USDC/USDT approval
3. Handle transaction submission
4. Store transaction hash in database
5. Monitor for confirmation

### Token Precision
- USDC/USDT use 6 decimal places
- Price stored as string to preserve precision
- Input type="number" with step="0.000001"

## Availability Scheduling (v2.0)

### Overview
Mentors can now set availability schedules for each day of the week with customizable time slots, allowing mentees to book sessions only during available times.

### Database Schema
**New Table:** `mentor_availability`
- `id` (TEXT, Primary Key)
- `mentorId` (TEXT, FK to mentor_profile)
- `dayOfWeek` (INTEGER, 0-6 representing Sunday-Saturday)
- `startTime` (TIME, start time in HH:MM format)
- `endTime` (TIME, end time in HH:MM format)
- `duration` (INTEGER, 15/30/45 minutes)
- `timeBreak` (INTEGER, 5/10/15 minutes)
- `isActive` (BOOLEAN, default true)
- `createdAt`, `updatedAt` (TIMESTAMP)

### API Implementation
**Endpoint:** POST `/api/booking/create`
**Request Body:**
```typescript
{
  session: {
    title: string,
    description: string,
    type: 'FREE' | 'PAID' | 'COMMITMENT',
    token?: string,
    price?: string,
    duration: number,
    timeBreak: number,
  },
  availability: [
    {
      dayOfWeek: number,
      startTime: string,
      endTime: string,
      duration: number,
      timeBreak: number,
    }
  ]
}
```

### UI Components
**New Section:** "Availability Schedule" (with Calendar icon)

**Features:**
- 7-day grid layout (Sunday through Saturday)
- Checkbox to enable/disable each day
- For enabled days:
  - Start time input (type="time")
  - End time input (type="time")
  - Duration dropdown (15, 30, 45 minutes)
  - Time break dropdown (5, 10, 15 minutes)

**Default Schedule:**
- Monday-Friday: Enabled, 09:00-17:00, 30 min duration, 5 min break
- Saturday-Sunday: Disabled

### Validation Rules
- Day of week: 0-6 (Sunday-Saturday)
- Time format: HH:MM (24-hour format)
- Start time < end time
- Duration: must be one of [15, 30, 45]
- Time break: must be one of [5, 10, 15]

### State Management
```typescript
const [availability, setAvailability] = useState([
  { dayOfWeek: 1, enabled: true, startTime: '09:00', endTime: '17:00', duration: '30', timeBreak: '5' },
  // ... 6 more days
])
```

### Submission Flow
1. User completes session details form
2. User configures availability for desired days
3. Form submission sends both session and availability data
4. Server validates availability data
5. Session and availability records created in database
6. User redirected to dashboard with success message

### Positive Consequences
- ✅ Flexible per-day scheduling
- ✅ Customizable time slots
- ✅ Consistent with existing form patterns
- ✅ Clear visual feedback
- ✅ Default values reduce setup time
- ✅ Comprehensive validation

### Future Enhancements
- Bulk availability editing (copy one day to another)
- Recurring availability patterns
- Timezone awareness
- Holiday/blackout dates
- Buffer time between bookings

## Accessibility Features
- Proper label associations
- Required field indicators
- Clear section headings
- Keyboard navigation support
- High contrast color scheme
- Screen reader compatible structure

## Validation Strategy

### Client-Side Validation
- HTML5 required attributes
- Type-specific input validation
- Conditional field requirements

### Future Server-Side Validation
- Zod schema validation
- Business rule validation (min/max prices, etc.)
- Duplicate session prevention
- Mentor profile verification

## References
- [React Controlled Components](https://react.dev/reference/react/useState)
- [Form Validation Best Practices](https://web.dev/learn/forms/form-validation/)
- [Radix UI Select](https://www.radix-ui.com/docs/primitives/components/select)
- [Ethereum Token Standards](https://ethereum.org/en/developers/docs/standards/tokens/erc-20/)
