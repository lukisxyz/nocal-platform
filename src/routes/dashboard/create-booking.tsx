import { createFileRoute } from '@tanstack/react-router'
import { authMiddleware } from '@/lib/auth-middleware'
import { Link } from '@tanstack/react-router'
import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { BOOKING_TYPES, TOKEN_TYPES, SESSION_DURATIONS, TIME_BREAKS } from '@/lib/constants'
import { ArrowLeft, DollarSign, Gift, CreditCard, Coins } from 'lucide-react'

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
    token: '',
    price: '',
    duration: '',
    timeBreak: '5',
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implement save to database
    console.log('Creating booking session:', formData)
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
          {/* Booking Type Selection */}
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

          {/* Basic Information */}
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

          {/* Payment Configuration */}
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
                  <Select
                    value={formData.token}
                    onValueChange={(value) => handleInputChange('token', value)}
                  >
                    <SelectTrigger className="bg-white border-gray-300 text-gray-900">
                      <SelectValue placeholder="Select token" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-gray-300">
                      {Object.values(TOKEN_TYPES).map((token) => (
                        <SelectItem
                          key={token}
                          value={token}
                          className="text-gray-900 focus:bg-gray-100 focus:text-gray-900"
                        >
                          {token}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                        {formData.token || 'Token'}
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

          {/* Submit */}
          <div className="flex justify-end gap-4">
            <Link to="/dashboard">
              <Button variant="outline">Cancel</Button>
            </Link>
            <Button type="submit" disabled={!formData.type}>
              Create Booking Session
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
