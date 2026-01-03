import { createFileRoute } from '@tanstack/react-router'
import { authMiddleware } from '@/lib/auth-middleware'
import { Link } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { BOOKING_TYPES, TOKEN_TYPES, SESSION_DURATIONS, TIME_BREAKS } from '@/lib/constants'
import { updateBookingSchema, type UpdateBookingFormData, DAYS_OF_WEEK, deleteBookingSchema, type DeleteBookingFormData } from '@/lib/validations'
import { useBookingSession } from '@/queries/use-booking-sessions'
import { useUpdateBookingSession, useDeleteBookingSession } from '@/queries/use-booking-mutations'
import { ArrowLeft, DollarSign, Gift, CreditCard, Coins, AlertTriangle, Calendar } from 'lucide-react'
import { toast } from 'sonner'

export const Route = createFileRoute('/dashboard/update-booking/$bookingId')({
  component: RouteComponent,
  server: {
    middleware: [authMiddleware],
  },
})

function RouteComponent() {
  const { bookingId } = Route.useParams()
  const { data: session } = useBookingSession(bookingId)
  const updateSession = useUpdateBookingSession()
  const deleteSession = useDeleteBookingSession()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const form = useForm<UpdateBookingFormData>({
    resolver: zodResolver(updateBookingSchema),
    defaultValues: {
      title: '',
      description: '',
      type: 'FREE' as any,
      token: 'USDC' as any,
      price: '',
      duration: '30',
      timeBreak: '5',
      isActive: true,
      availability: [
        { dayOfWeek: 0, enabled: false, startTime: '09:00', endTime: '17:00', duration: '30', timeBreak: '5' },
        { dayOfWeek: 1, enabled: false, startTime: '09:00', endTime: '17:00', duration: '30', timeBreak: '5' },
        { dayOfWeek: 2, enabled: false, startTime: '09:00', endTime: '17:00', duration: '30', timeBreak: '5' },
        { dayOfWeek: 3, enabled: false, startTime: '09:00', endTime: '17:00', duration: '30', timeBreak: '5' },
        { dayOfWeek: 4, enabled: false, startTime: '09:00', endTime: '17:00', duration: '30', timeBreak: '5' },
        { dayOfWeek: 5, enabled: false, startTime: '09:00', endTime: '17:00', duration: '30', timeBreak: '5' },
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
    if (session) {
      setValue('title', session.title)
      setValue('description', session.description)
      setValue('type', session.type as any)
      setValue('token', (session.token || 'USDC') as any)
      setValue('price', session.price || '')
      setValue('duration', session.duration.toString())
      setValue('timeBreak', session.timeBreak.toString())
      setValue('isActive', session.isActive)

      if (session.availability && session.availability.length > 0) {
        const updatedAvailability = [
          { dayOfWeek: 0, enabled: false, startTime: '09:00', endTime: '17:00', duration: '30', timeBreak: '5' },
          { dayOfWeek: 1, enabled: false, startTime: '09:00', endTime: '17:00', duration: '30', timeBreak: '5' },
          { dayOfWeek: 2, enabled: false, startTime: '09:00', endTime: '17:00', duration: '30', timeBreak: '5' },
          { dayOfWeek: 3, enabled: false, startTime: '09:00', endTime: '17:00', duration: '30', timeBreak: '5' },
          { dayOfWeek: 4, enabled: false, startTime: '09:00', endTime: '17:00', duration: '30', timeBreak: '5' },
          { dayOfWeek: 5, enabled: false, startTime: '09:00', endTime: '17:00', duration: '30', timeBreak: '5' },
          { dayOfWeek: 6, enabled: false, startTime: '09:00', endTime: '17:00', duration: '30', timeBreak: '5' },
        ]

        session.availability.forEach((avail) => {
          const index = updatedAvailability.findIndex(d => d.dayOfWeek === avail.dayOfWeek)
          if (index !== -1) {
            updatedAvailability[index] = {
              dayOfWeek: avail.dayOfWeek,
              enabled: true,
              startTime: avail.startTime,
              endTime: avail.endTime,
              duration: avail.duration.toString(),
              timeBreak: avail.timeBreak.toString(),
            }
          }
        })

        updatedAvailability.forEach((day, index) => {
          setValue(`availability.${index}`, day)
        })
      }
    }
  }, [session, setValue])

  useEffect(() => {
    if (watchedDuration && watchedTimeBreak) {
      fields.forEach((field, index) => {
        setValue(`availability.${index}.duration`, watchedDuration)
        setValue(`availability.${index}.timeBreak`, watchedTimeBreak)
      })
    }
  }, [watchedDuration, watchedTimeBreak, fields, setValue])

  const onSubmit = (data: UpdateBookingFormData) => {
    const enabledDays = data.availability.filter(day => day.enabled)

    updateSession.mutate({
      sessionId: bookingId!,
      data: {
        session: {
          title: data.title,
          description: data.description,
          type: data.type,
          token: data.type !== 'FREE' ? data.token : undefined,
          price: data.type !== 'FREE' ? data.price : undefined,
          duration: parseInt(data.duration),
          timeBreak: parseInt(data.timeBreak),
          isActive: data.isActive,
        },
        availability: enabledDays.map(day => ({
          dayOfWeek: day.dayOfWeek,
          startTime: day.startTime,
          endTime: day.endTime,
          duration: parseInt(day.duration),
          timeBreak: parseInt(day.timeBreak),
        })),
      },
    })
  }

  const deleteForm = useForm<DeleteBookingFormData>({
    resolver: zodResolver(deleteBookingSchema),
    defaultValues: {
      confirmation: '',
    },
  })

  const { register: registerDelete, handleSubmit: handleSubmitDelete, formState: { errors: deleteErrors }, reset: resetDelete } = deleteForm

  const handleConfirmDelete = handleSubmitDelete(async () => {
    try {
      await deleteSession.mutateAsync(bookingId!)
      setShowDeleteDialog(false)
      toast.success('Booking session deleted successfully')
      resetDelete()
    } catch (error) {
      toast.error('Failed to delete booking session. Please try again.')
    }
  })

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
            <h1 className="text-3xl font-bold text-gray-900">Edit Booking Session</h1>
            <p className="text-gray-600 mt-1">Update session details</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Card className="bg-white border-gray-200">
            <CardHeader>
              <CardTitle className="text-gray-900">Session Status</CardTitle>
              <CardDescription className="text-gray-600">
                Control whether mentees can book this session
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="active" className="text-gray-800 font-medium">
                    Active
                  </Label>
                  <p className="text-sm text-gray-600">
                    When disabled, mentees cannot book new sessions
                  </p>
                </div>
                <Switch
                  id="active"
                  checked={watch('isActive')}
                  onCheckedChange={(checked) => setValue('isActive', checked)}
                />
              </div>
            </CardContent>
          </Card>

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
                <Label htmlFor="title" className="text-gray-800">Title</Label>
                <Input
                  id="title"
                  type="text"
                  placeholder="e.g., 1:1 Career Guidance Session"
                  className="bg-gray-50 border-gray-300 text-gray-900"
                  {...register('title')}
                />
                {errors.title && (
                  <p className="text-sm text-destructive">{errors.title.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-gray-800">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe what you'll cover in this session, who it's for, and what mentees can expect..."
                  className="bg-gray-50 border-gray-300 text-gray-900 min-h-[120px]"
                  {...register('description')}
                />
                {errors.description && (
                  <p className="text-sm text-destructive">{errors.description.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="duration" className="text-gray-800">Duration (minutes)</Label>
                  <Select
                    value={watch('duration')}
                    onValueChange={(value) => setValue('duration', value)}
                  >
                    <SelectTrigger className="bg-gray-50 border-gray-300 text-gray-900">
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-50 border-gray-300">
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
                  <Label htmlFor="timeBreak" className="text-gray-800">Time Break (minutes)</Label>
                  <Select
                    value={watch('timeBreak')}
                    onValueChange={(value) => setValue('timeBreak', value)}
                  >
                    <SelectTrigger className="bg-gray-50 border-gray-300 text-gray-900">
                      <SelectValue placeholder="Select time break" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-50 border-gray-300">
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
                  <Label htmlFor="token" className="text-gray-800">Token</Label>
                  <Select
                    value={watch('token')}
                    onValueChange={(value) => setValue('token', value as any)}
                  >
                    <SelectTrigger className="bg-gray-50 border-gray-300 text-gray-900">
                      <SelectValue placeholder="Select token" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-50 border-gray-300">
                      {Object.values(TOKEN_TYPES).map((token) => (
                        <SelectItem
                          key={token}
                          value={token}
                          className="text-gray-900 focus:bg-gray-100 focus:text-gray-900"
                        >
                          <div className="flex items-center gap-2">
                            <img src="/usd-coin-usdc-logo.svg" alt={token} className="h-5 w-5" />
                            {token}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.token && (
                    <p className="text-sm text-destructive">{errors.token.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price" className="text-gray-800">
                    {watchedType === 'COMMITMENT' ? 'Commitment Fee Amount' : 'Price'}
                  </Label>
                  <div className="relative">
                    <Input
                      id="price"
                      type="number"
                      step="0.000001"
                      min="0"
                      placeholder="0.000000"
                      className="bg-gray-50 border-gray-300 text-gray-900 pl-24"
                      {...register('price')}
                    />
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                      <img src="/usd-coin-usdc-logo.svg" alt="USDC" className="h-6 w-6" />
                      <span className="text-sm font-medium text-gray-700">{watch('token') || 'USDC'}</span>
                    </div>
                  </div>
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
                            className="bg-gray-50 border-gray-300 text-gray-900"
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
                            className="bg-gray-50 border-gray-300 text-gray-900"
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
                            <SelectTrigger className="bg-gray-50 border-gray-300 text-gray-900">
                              <SelectValue placeholder="Duration" />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-50 border-gray-300">
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
                            <SelectTrigger className="bg-gray-50 border-gray-300 text-gray-900">
                              <SelectValue placeholder="Break" />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-50 border-gray-300">
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

          <Card className="bg-white border-gray-200 border-red-200">
            <CardHeader>
              <CardTitle className="text-gray-900 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                Delete Booking Session
              </CardTitle>
              <CardDescription className="text-gray-600">
                Permanently delete this booking session
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                  <p className="text-gray-700 text-sm">
                    Once you delete this booking session, it cannot be restored. All associated bookings will be affected.
                  </p>
                </div>
                <Button
                  type='button'
                  variant="destructive"
                  onClick={() => setShowDeleteDialog(true)}
                >
                  Delete Booking Session
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Link to="/dashboard">
              <Button variant="outline">Cancel</Button>
            </Link>
            <Button
              type="submit"
              disabled={updateSession.isPending}
            >
              {updateSession.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="bg-white border-gray-200">
          <DialogHeader>
            <DialogTitle className="text-gray-900 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Delete Booking Session
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              This action cannot be undone. This will permanently delete this booking session.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-gray-700 text-sm mb-2">
                To confirm deletion, please type:
              </p>
              <p className="text-red-600 font-mono font-bold">
                DELETE
              </p>
            </div>

            <div className="space-y-2">
              <Input
                type="text"
                placeholder='Type "DELETE"'
                className="bg-gray-50 border-gray-300 text-gray-900"
                {...registerDelete('confirmation')}
              />
              {deleteErrors.confirmation && (
                <p className="text-sm text-destructive">{deleteErrors.confirmation.message}</p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={deleteSession.isPending}
            >
              {deleteSession.isPending ? 'Deleting...' : 'Delete Session'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
