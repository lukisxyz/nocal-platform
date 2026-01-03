import { createFileRoute } from '@tanstack/react-router'
import { authMiddleware } from '@/lib/auth-middleware'
import { Link, useRouter } from '@tanstack/react-router'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { PROFESSIONAL_FIELDS } from '@/lib/constants'
import { profileSchema, type ProfileFormData } from '@/lib/validations'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { useProfile, useUpdateProfile } from '@/queries/use-profile'
import { toast } from 'sonner'

export const Route = createFileRoute('/dashboard/update-profile')({
  component: RouteComponent,
  errorComponent: () => {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <Link to="/dashboard">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Update Profile</h1>
              <p className="text-muted-foreground mt-1">Keep your profile up to date</p>
            </div>
          </div>
          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <p className="text-center text-destructive">Error loading profile. Please try again.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  },
  server: {
    middleware: [authMiddleware],
  },
})

function RouteComponent() {
  const router = useRouter()
  const { data: profile, isLoading: isProfileLoading, error: profileError } = useProfile()
  const updateProfileMutation = useUpdateProfile()

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: '',
      name: '',
      bio: '',
      professionalField: '' as any,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
    },
  })

  const { register, handleSubmit, setValue, watch, formState: { errors } } = form

  useEffect(() => {
    if (profile) {
      setValue('username', profile.username || '')
      setValue('name', profile.name || '')
      setValue('bio', profile.bio || '')
      setValue('professionalField', (profile.professionalField || '') as any)
      setValue('timezone', profile.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC')
    }
  }, [profile, setValue])

  const watchedName = watch('name')
  const watchedUsername = watch('username')

  const onSubmit = async (data: ProfileFormData) => {
    try {
      await updateProfileMutation.mutateAsync(data)
      toast.success('Profile updated successfully!')
      setTimeout(() => {
        router.navigate({ to: '/dashboard' })
      }, 1000)
    } catch (error) {
      toast.error('Failed to update profile')
    }
  }

  const handleUserName = () => {
    if (watchedUsername && watchedUsername.length > 5) return
    const generatedUsername = watchedName
      ?.toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '_')
    if (generatedUsername) {
      setValue('username', generatedUsername)
    }
  }

  if (profileError) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <Link to="/dashboard">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Update Profile</h1>
              <p className="text-muted-foreground mt-1">Keep your profile up to date</p>
            </div>
          </div>
          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <p className="text-center text-destructive">Error loading profile. Please try again.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/dashboard">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Update Profile</h1>
            <p className="text-muted-foreground mt-1">Keep your profile up to date</p>
          </div>
        </div>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Profile Information</CardTitle>
            <CardDescription className="text-muted-foreground">
              Update your details to help mentees understand your expertise
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your unique username"
                  {...register('username')}
                />
                {errors.username && (
                  <p className="text-sm text-destructive">{errors.username.message}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Your unique identifier. Will be auto-generated from your name if left empty.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  {...register('name')}
                  onBlur={handleUserName}
                />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  placeholder="Tell mentees about yourself, your experience, and what you can help with..."
                  className="min-h-[120px]"
                  {...register('bio')}
                />
                {errors.bio && (
                  <p className="text-sm text-destructive">{errors.bio.message}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  {watch('bio')?.length || 0}/500 characters
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="professionalField">
                  Professional Field
                </Label>
                <Select
                  value={watch('professionalField')}
                  onValueChange={(value) => setValue('professionalField', value as any)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your professional field" />
                  </SelectTrigger>
                  <SelectContent>
                    {PROFESSIONAL_FIELDS.map((field) => (
                      <SelectItem
                        key={field}
                        value={field}
                      >
                        {field}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.professionalField && (
                  <p className="text-sm text-destructive">{errors.professionalField.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Input
                  id="timezone"
                  type="text"
                  {...register('timezone')}
                />
                {errors.timezone && (
                  <p className="text-sm text-destructive">{errors.timezone.message}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Your timezone for scheduling sessions
                </p>
              </div>

              <div className="flex justify-end gap-4 pt-4">
                <Link to="/dashboard">
                  <Button variant="outline">Cancel</Button>
                </Link>
                <Button
                  type="submit"
                  disabled={updateProfileMutation.isPending}
                >
                  {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
