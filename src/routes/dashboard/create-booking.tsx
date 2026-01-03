import { createFileRoute } from '@tanstack/react-router'
import { authMiddleware } from '@/lib/auth-middleware'
import { Link } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { BOOKING_TYPES, SESSION_DURATIONS, TIME_BREAKS } from '@/lib/constants'
import { useCreateBookingSession } from '@/queries/use-booking-mutations'
import { ArrowLeft, DollarSign, Gift, CreditCard, Coins, Calendar } from 'lucide-react'

const DAYS_OF_WEEK = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
]

export const Route = createFileRoute('/dashboard/create-booking')({
  component: RouteComponent,
  server: {
    middleware: [authMiddleware],
  },
})

function RouteComponent() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: '',
    token: import.meta.env.VITE_USDC_TOKEN_ADDRESS,
    price: '',
    duration: '30',
    timeBreak: '5',
  })

  const [availability, setAvailability] = useState([
    { dayOfWeek: 1, enabled: true, startTime: '09:00', endTime: '17:00', duration: '30', timeBreak: '5' },
    { dayOfWeek: 2, enabled: true, startTime: '09:00', endTime: '17:00', duration: '30', timeBreak: '5' },
    { dayOfWeek: 3, enabled: true, startTime: '09:00', endTime: '17:00', duration: '30', timeBreak: '5' },
    { dayOfWeek: 4, enabled: true, startTime: '09:00', endTime: '17:00', duration: '30', timeBreak: '5' },
    { dayOfWeek: 5, enabled: true, startTime: '09:00', endTime: '17:00', duration: '30', timeBreak: '5' },
    { dayOfWeek: 0, enabled: false, startTime: '09:00', endTime: '17:00', duration: '30', timeBreak: '5' },
    { dayOfWeek: 6, enabled: false, startTime: '09:00', endTime: '17:00', duration: '30', timeBreak: '5' },
  ])

  const createSession = useCreateBookingSession()

  useEffect(() => {
    if (formData.duration && formData.timeBreak) {
      setAvailability(prev => prev.map(day => ({
        ...day,
        duration: formData.duration,
        timeBreak: formData.timeBreak,
      })))
    }
  }, [formData.duration, formData.timeBreak])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleAvailabilityChange = (dayOfWeek: number, field: string, value: string) => {
    setAvailability(prev => prev.map(day =>
      day.dayOfWeek === dayOfWeek
        ? { ...day, [field]: value }
        : day
    ))
  }

  const handleToggleDay = (dayOfWeek: number) => {
    setAvailability(prev => prev.map(day =>
      day.dayOfWeek === dayOfWeek
        ? { ...day, enabled: !day.enabled }
        : day
    ))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const enabledDays = availability.filter(day => day.enabled)

    createSession.mutate({
      session: {
        title: formData.title,
        description: formData.description,
        type: formData.type as 'FREE' | 'PAID' | 'COMMITMENT',
        token: formData.type !== 'FREE' ? formData.token : undefined,
        price: formData.type !== 'FREE' ? formData.price : undefined,
        duration: parseInt(formData.duration),
        timeBreak: parseInt(formData.timeBreak),
      },
      availability: enabledDays.map(day => ({
        dayOfWeek: day.dayOfWeek,
        startTime: day.startTime,
        endTime: day.endTime,
        duration: parseInt(day.duration),
        timeBreak: parseInt(day.timeBreak),
      })),
    })
  }

  const bookingTypeInfo = {
    FREE: {
      icon: <Gift className="h-5 w-5" />,
      label: 'Free Session',
      description: 'No payment required',
      color: 'bg-blue-50 border-blue-500',
    },
    PAID: {
      icon: <DollarSign className="h-5 w-5" />,
      label: 'Paid Session',
      description: 'Fixed price payment required',
      color: 'bg-green-50 border-green-500',
    },
    COMMITMENT: {
      icon: <CreditCard className="h-5 w-5" />,
      label: 'Commitment Fee',
      description: 'Refundable deposit required',
      color: 'bg-purple-50 border-purple-500',
    },
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/dashboard">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Create Booking Session</h1>
            <p className="text-gray-600 mt-1">Set up a new session for mentees to book</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="bg-white border-gray-200">
            <CardHeader>
              <CardTitle className="text-gray-900">Booking Type</CardTitle>
              <CardDescription className="text-gray-600">
                Choose how mentees will pay for this session
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {(Object.keys(BOOKING_TYPES) as Array<keyof typeof BOOKING_TYPES>).map((type) => {
                  const info = bookingTypeInfo[type]
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => handleInputChange('type', type)}
                      className={`
                        p-4 rounded-lg border-2 transition-all text-left
                        ${formData.type === type ? info.color : 'bg-white border-gray-300 hover:border-gray-400'}
                      `}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        {info.icon}
                        <span className="font-medium text-gray-900">{info.label}</span>
                      </div>
                      <p className="text-sm text-gray-600">{info.description}</p>
                    </button>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-gray-200">
            <CardHeader>
              <CardTitle className="text-gray-900">Session Details</CardTitle>
              <CardDescription className="text-gray-600">
                Basic information about your booking session
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-gray-700">Title</Label>
                <Input
                  id="title"
                  type="text"
                  placeholder="e.g., 1:1 Career Guidance Session"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className="bg-white border-gray-300 text-gray-900"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-gray-700">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe what you'll cover in this session, who it's for, and what mentees can expect..."
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="bg-white border-gray-300 text-gray-900 min-h-[120px]"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="duration" className="text-gray-700">Duration (minutes)</Label>
                  <Select
                    value={formData.duration}
                    onValueChange={(value) => handleInputChange('duration', value)}
                  >
                    <SelectTrigger className="bg-white border-gray-300 text-gray-900">
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-gray-300">
                      {SESSION_DURATIONS.map((duration) => (
                        <SelectItem
                          key={duration}
                          value={duration.toString()}
                          className="text-gray-900 focus:bg-gray-100 focus:text-gray-900"
                        >
                          {duration} minutes
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timeBreak" className="text-gray-700">Time Break (minutes)</Label>
                  <Select
                    value={formData.timeBreak}
                    onValueChange={(value) => handleInputChange('timeBreak', value)}
                  >
                    <SelectTrigger className="bg-white border-gray-300 text-gray-900">
                      <SelectValue placeholder="Select time break" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-gray-300">
                      {TIME_BREAKS.map((timeBreak) => (
                        <SelectItem
                          key={timeBreak}
                          value={timeBreak.toString()}
                          className="text-gray-900 focus:bg-gray-100 focus:text-gray-900"
                        >
                          {timeBreak} minutes
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {formData.type && formData.type !== 'FREE' && (
            <Card className="bg-white border-gray-200">
              <CardHeader>
                <CardTitle className="text-gray-900 flex items-center gap-2">
                  <Coins className="h-5 w-5" />
                  Payment Configuration
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Set the payment details for this session
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="token" className="text-gray-700">Token</Label>
                  <Input
                    id="token"
                    type="text"
                    value="USDC"
                    readOnly
                    className="bg-gray-100 border-gray-300 text-gray-900 cursor-not-allowed"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price" className="text-gray-700">
                    {formData.type === 'COMMITMENT' ? 'Commitment Fee Amount' : 'Price'}
                  </Label>
                  <div className="relative">
                    <Input
                      id="price"
                      type="number"
                      step="0.000001"
                      min="0"
                      placeholder="0.000000"
                      value={formData.price}
                      onChange={(e) => handleInputChange('price', e.target.value)}
                      className="bg-white border-gray-300 text-gray-900 pl-20"
                      required
                    />
                    <div className="absolute left-3 top-1/2 -translate-y-1/2">
                      <Badge variant="outline" className="text-gray-600 border-gray-300">
                        USDC
                      </Badge>
                    </div>
                  </div>
                  {formData.type === 'COMMITMENT' && (
                    <p className="text-xs text-gray-600">
                      This is a refundable deposit that will be returned to the mentee after the session is completed.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="bg-white border-gray-200">
            <CardHeader>
              <CardTitle className="text-gray-900 flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Availability Schedule
              </CardTitle>
              <CardDescription className="text-gray-600">
                Set your available days and times (can be customized per day)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {DAYS_OF_WEEK.map((day) => {
                  const dayData = availability.find(d => d.dayOfWeek === day.value)!
                  return (
                    <div key={day.value} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={dayData.enabled}
                            onChange={() => handleToggleDay(day.value)}
                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <Label className="text-gray-900 font-medium">{day.label}</Label>
                        </div>
                      </div>

                      {dayData.enabled && (
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div className="space-y-2">
                            <Label className="text-gray-700 text-sm">Start Time</Label>
                            <Input
                              type="time"
                              value={dayData.startTime}
                              onChange={(e) => handleAvailabilityChange(day.value, 'startTime', e.target.value)}
                              className="bg-white border-gray-300 text-gray-900"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label className="text-gray-700 text-sm">End Time</Label>
                            <Input
                              type="time"
                              value={dayData.endTime}
                              onChange={(e) => handleAvailabilityChange(day.value, 'endTime', e.target.value)}
                              className="bg-white border-gray-300 text-gray-900"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label className="text-gray-700 text-sm">Duration</Label>
                            <Select
                              value={dayData.duration}
                              onValueChange={(value) => handleAvailabilityChange(day.value, 'duration', value)}
                            >
                              <SelectTrigger className="bg-white border-gray-300 text-gray-900">
                                <SelectValue placeholder="Duration" />
                              </SelectTrigger>
                              <SelectContent className="bg-white border-gray-300">
                                {SESSION_DURATIONS.map((duration) => (
                                  <SelectItem
                                    key={duration}
                                    value={duration.toString()}
                                    className="text-gray-900 focus:bg-gray-100 focus:text-gray-900"
                                  >
                                    {duration} min
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label className="text-gray-700 text-sm">Break</Label>
                            <Select
                              value={dayData.timeBreak}
                              onValueChange={(value) => handleAvailabilityChange(day.value, 'timeBreak', value)}
                            >
                              <SelectTrigger className="bg-white border-gray-300 text-gray-900">
                                <SelectValue placeholder="Break" />
                              </SelectTrigger>
                              <SelectContent className="bg-white border-gray-300">
                                {TIME_BREAKS.filter(tb => tb <= 15).map((timeBreak) => (
                                  <SelectItem
                                    key={timeBreak}
                                    value={timeBreak.toString()}
                                    className="text-gray-900 focus:bg-gray-100 focus:text-gray-900"
                                  >
                                    {timeBreak} min
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Link to="/dashboard">
              <Button variant="outline">Cancel</Button>
            </Link>
            <Button
              type="submit"
              disabled={!formData.type || createSession.isPending}
            >
              {createSession.isPending ? 'Creating...' : 'Create Booking Session'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
