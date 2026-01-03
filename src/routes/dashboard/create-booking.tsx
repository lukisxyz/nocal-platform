import { createFileRoute } from '@tanstack/react-router'
import { authMiddleware } from '@/lib/auth-middleware'
import { Link } from '@tanstack/react-router'
import { useEffect } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { BOOKING_TYPES, SESSION_DURATIONS, TIME_BREAKS } from '@/lib/constants'
import { bookingSessionSchema, type BookingSessionFormData, DAYS_OF_WEEK } from '@/lib/validations'
import { useCreateBookingSession } from '@/queries/use-booking-mutations'
import { ArrowLeft, DollarSign, Gift, CreditCard, Coins, Calendar } from 'lucide-react'
import { toast } from 'sonner'

export const Route = createFileRoute('/dashboard/create-booking')({
  component: RouteComponent,
  server: {
    middleware: [authMiddleware],
  },
})

function RouteComponent() {
  const createSession = useCreateBookingSession()

  const form = useForm<BookingSessionFormData>({
    resolver: zodResolver(bookingSessionSchema),
    defaultValues: {
      title: '',
      description: '',
      type: '' as any,
      token: import.meta.env.VITE_USDC_TOKEN_ADDRESS,
      price: '',
      duration: '30',
      timeBreak: '5',
      availability: [
        { dayOfWeek: 1, enabled: true, startTime: '09:00', endTime: '17:00', duration: '30', timeBreak: '5' },
        { dayOfWeek: 2, enabled: true, startTime: '09:00', endTime: '17:00', duration: '30', timeBreak: '5' },
        { dayOfWeek: 3, enabled: true, startTime: '09:00', endTime: '17:00', duration: '30', timeBreak: '5' },
        { dayOfWeek: 4, enabled: true, startTime: '09:00', endTime: '17:00', duration: '30', timeBreak: '5' },
        { dayOfWeek: 5, enabled: true, startTime: '09:00', endTime: '17:00', duration: '30', timeBreak: '5' },
        { dayOfWeek: 0, enabled: false, startTime: '09:00', endTime: '17:00', duration: '30', timeBreak: '5' },
        { dayOfWeek: 6, enabled: false, startTime: '09:00', endTime: '17:00', duration: '30', timeBreak: '5' },
      ],
    },
  })

  const { register, handleSubmit, watch, setValue, control, formState: { errors } } = form

  const { fields } = useFieldArray({
    control,
    name: 'availability',
  })

  const watchedType = watch('type')
  const watchedDuration = watch('duration')
  const watchedTimeBreak = watch('timeBreak')

  useEffect(() => {
    if (watchedDuration && watchedTimeBreak) {
      fields.forEach((field, index) => {
        setValue(`availability.${index}.duration`, watchedDuration)
        setValue(`availability.${index}.timeBreak`, watchedTimeBreak)
      })
    }
  }, [watchedDuration, watchedTimeBreak, fields, setValue])

  const onSubmit = (data: BookingSessionFormData) => {
    const enabledDays = data.availability.filter(day => day.enabled)

    if (enabledDays.length === 0) {
      toast.error('At least one day must be enabled')
      return
    }

    createSession.mutate({
      session: {
        title: data.title,
        description: data.description,
        type: data.type,
        token: data.type !== 'FREE' ? data.token : undefined,
        price: data.type !== 'FREE' ? data.price : undefined,
        duration: parseInt(data.duration),
        timeBreak: parseInt(data.timeBreak),
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

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
                      onClick={() => setValue('type', type as any)}
                      className={`
                        p-4 rounded-lg border-2 transition-all text-left
                        ${watchedType === type ? info.color : 'bg-white border-gray-300 hover:border-gray-400'}
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
              {errors.type && (
                <p className="text-sm text-destructive mt-2">{errors.type.message}</p>
              )}
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
                  className="bg-white border-gray-300 text-gray-900"
                  {...register('title')}
                />
                {errors.title && (
                  <p className="text-sm text-destructive">{errors.title.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-gray-700">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe what you'll cover in this session, who it's for, and what mentees can expect..."
                  className="bg-white border-gray-300 text-gray-900 min-h-[120px]"
                  {...register('description')}
                />
                {errors.description && (
                  <p className="text-sm text-destructive">{errors.description.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="duration" className="text-gray-700">Duration (minutes)</Label>
                  <Select
                    value={watch('duration')}
                    onValueChange={(value) => setValue('duration', value)}
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
                  {errors.duration && (
                    <p className="text-sm text-destructive">{errors.duration.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timeBreak" className="text-gray-700">Time Break (minutes)</Label>
                  <Select
                    value={watch('timeBreak')}
                    onValueChange={(value) => setValue('timeBreak', value)}
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
                  {errors.timeBreak && (
                    <p className="text-sm text-destructive">{errors.timeBreak.message}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {watchedType && watchedType !== 'FREE' && (
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
                  <div className="relative">
                    <Input
                      id="token"
                      type="text"
                      value="USDC"
                      readOnly
                      className="bg-gray-100 border-gray-300 text-gray-900 cursor-not-allowed pl-20"
                      {...register('token')}
                    />
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                      <img src="/usd-coin-usdc-logo.svg" alt="USDC" className="h-6 w-6" />
                      <span className="text-sm font-medium text-gray-700">USDC</span>
                    </div>
                  </div>
                  {errors.token && (
                    <p className="text-sm text-destructive">{errors.token.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price" className="text-gray-700">
                    {watchedType === 'COMMITMENT' ? 'Commitment Fee Amount' : 'Price'}
                  </Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.000001"
                    min="0"
                    placeholder="0.000000"
                    className="bg-white border-gray-300 text-gray-900"
                    {...register('price')}
                  />
                  {errors.price && (
                    <p className="text-sm text-destructive">{errors.price.message}</p>
                  )}
                  {watchedType === 'COMMITMENT' && (
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
                {fields.map((field, index) => {
                  const day = DAYS_OF_WEEK[field.dayOfWeek]
                  return (
                    <div key={field.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            {...register(`availability.${index}.enabled`)}
                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <Label className="text-gray-900 font-medium">{day.label}</Label>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="space-y-2">
                          <Label className="text-gray-700 text-sm">Start Time</Label>
                          <Input
                            type="time"
                            {...register(`availability.${index}.startTime`)}
                            className="bg-white border-gray-300 text-gray-900"
                          />
                          {errors.availability?.[index]?.startTime && (
                            <p className="text-sm text-destructive">{errors.availability[index]?.startTime?.message}</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label className="text-gray-700 text-sm">End Time</Label>
                          <Input
                            type="time"
                            {...register(`availability.${index}.endTime`)}
                            className="bg-white border-gray-300 text-gray-900"
                          />
                          {errors.availability?.[index]?.endTime && (
                            <p className="text-sm text-destructive">{errors.availability[index]?.endTime?.message}</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label className="text-gray-700 text-sm">Duration</Label>
                          <Select
                            value={watch(`availability.${index}.duration`)}
                            onValueChange={(value) => setValue(`availability.${index}.duration`, value)}
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
                          {errors.availability?.[index]?.duration && (
                            <p className="text-sm text-destructive">{errors.availability[index]?.duration?.message}</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label className="text-gray-700 text-sm">Break</Label>
                          <Select
                            value={watch(`availability.${index}.timeBreak`)}
                            onValueChange={(value) => setValue(`availability.${index}.timeBreak`, value)}
                          >
                            <SelectTrigger className="bg-white border-gray-300 text-gray-900">
                              <SelectValue placeholder="Break" />
                            </SelectTrigger>
                            <SelectContent className="bg-white border-gray-300">
                              {TIME_BREAKS.map((timeBreak) => (
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
                          {errors.availability?.[index]?.timeBreak && (
                            <p className="text-sm text-destructive">{errors.availability[index]?.timeBreak?.message}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
                {errors.availability && (
                  <p className="text-sm text-destructive">{errors.availability.message}</p>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Link to="/dashboard">
              <Button variant="outline">Cancel</Button>
            </Link>
            <Button
              type="submit"
              disabled={!watchedType || createSession.isPending}
            >
              {createSession.isPending ? 'Creating...' : 'Create Booking Session'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
