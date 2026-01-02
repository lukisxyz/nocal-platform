import { createFileRoute } from '@tanstack/react-router'
import { authMiddleware } from '@/lib/auth-middleware'
import { Link } from '@tanstack/react-router'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar, DollarSign, Users, Clock } from 'lucide-react'

export const Route = createFileRoute('/dashboard/')({
  component: RouteComponent,
  server: {
    middleware: [authMiddleware],
  },
})

function RouteComponent() {
  // Mock data - will be replaced with real data from database
  const stats = {
    totalSessions: 0,
    totalRevenue: 0,
    completedSessions: 0,
    pendingBookings: 0,
  }

  const recentSessions = []

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">Manage your mentoring sessions</p>
          </div>
          <div className="flex gap-4">
            <Link to="/dashboard/update-profile">
              <Button variant="outline">Update Profile</Button>
            </Link>
            <Link to="/dashboard/create-booking">
              <Button>Create Booking</Button>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white border-gray-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Sessions</CardTitle>
              <Calendar className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stats.totalSessions}</div>
              <p className="text-xs text-gray-500 mt-1">All booking sessions</p>
            </CardContent>
          </Card>

          <Card className="bg-white border-gray-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {stats.totalRevenue} USDC
              </div>
              <p className="text-xs text-gray-500 mt-1">From paid sessions</p>
            </CardContent>
          </Card>

          <Card className="bg-white border-gray-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Completed</CardTitle>
              <Users className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stats.completedSessions}</div>
              <p className="text-xs text-gray-500 mt-1">Sessions completed</p>
            </CardContent>
          </Card>

          <Card className="bg-white border-gray-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Pending</CardTitle>
              <Clock className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stats.pendingBookings}</div>
              <p className="text-xs text-gray-500 mt-1">Awaiting confirmation</p>
            </CardContent>
          </Card>
        </div>

        {/* Booking Sessions List */}
        <Card className="bg-white border-gray-200">
          <CardHeader>
            <CardTitle className="text-gray-900">Your Booking Sessions</CardTitle>
            <CardDescription className="text-gray-600">
              Manage your available booking sessions
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentSessions.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No booking sessions yet</h3>
                <p className="text-gray-600 mb-4">
                  Create your first booking session to start accepting mentees
                </p>
                <Link to="/dashboard/create-booking">
                  <Button>Create Booking Session</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Session items would go here */}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <Card className="bg-white border-gray-200">
            <CardHeader>
              <CardTitle className="text-gray-900">Profile Management</CardTitle>
              <CardDescription className="text-gray-600">
                Keep your profile up to date
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-gray-700 text-sm">
                  Update your username, name, bio, professional field, and timezone to help mentees find and understand your expertise.
                </p>
                <Link to="/dashboard/update-profile">
                  <Button variant="outline" className="w-full">Update Profile</Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-gray-200">
            <CardHeader>
              <CardTitle className="text-gray-900">Danger Zone</CardTitle>
              <CardDescription className="text-gray-600">
                Irreversible actions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-gray-700 text-sm">
                  Permanently delete your account and all associated data. This action cannot be undone.
                </p>
                <Link to="/dashboard/danger-zone">
                  <Button variant="destructive" className="w-full">Delete Account</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
