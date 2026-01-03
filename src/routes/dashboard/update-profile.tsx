import { createFileRoute } from '@tanstack/react-router'
import { authMiddleware } from '@/lib/auth-middleware'
import { Link, useRouter } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { PROFESSIONAL_FIELDS } from '@/lib/constants'
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

  const [formData, setFormData] = useState({
    username: '',
    name: '',
    bio: '',
    professionalField: '',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
  })

  useEffect(() => {
    if (profile) {
      setFormData({
        username: profile.username || '',
        name: profile.name || '',
        bio: profile.bio || '',
        professionalField: profile.professionalField || '',
        timezone: profile.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
      })
    }
  }, [profile])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleUserName = () => {
    if (formData.username.length > 5) return;
    const generatedUsername = formData.name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '_')
    setFormData(prev => ({ ...prev, username: generatedUsername }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await updateProfileMutation.mutateAsync(formData)
      toast.success('Profile updated successfully!')
      setTimeout(() => {
        router.navigate({ to: '/dashboard' })
      }, 1000)
    } catch (error) {
      toast.error('Failed to update profile')
      console.error('Error updating profile:', error)
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
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your unique username"
                  value={formData.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  required
                />
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
                  value={formData.name}
                  onBlur={() => handleUserName()}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  placeholder="Tell mentees about yourself, your experience, and what you can help with..."
                  value={formData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  className="min-h-[120px]"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  {formData.bio.length}/500 characters
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="professionalField">
                  Professional Field
                </Label>
                <Select
                  key={formData.professionalField}
                  value={formData.professionalField}
                  onValueChange={(value) => handleInputChange('professionalField', value)}
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
              </div>

              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Input
                  id="timezone"
                  type="text"
                  value={formData.timezone}
                  onChange={(e) => handleInputChange('timezone', e.target.value)}
                  required
                />
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
