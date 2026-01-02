import { createFileRoute } from '@tanstack/react-router'
import { authMiddleware } from '@/lib/auth-middleware'
import { Link } from '@tanstack/react-router'
import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ArrowLeft, AlertTriangle } from 'lucide-react'

export const Route = createFileRoute('/dashboard/danger-zone')({
  component: RouteComponent,
  server: {
    middleware: [authMiddleware],
  },
})

function RouteComponent() {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [confirmationText, setConfirmationText] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDeleteClick = () => {
    setShowDeleteDialog(true)
  }

  const handleConfirmDelete = async () => {
    if (confirmationText !== 'I delete this account') {
      alert('Please type "I delete this account" to confirm')
      return
    }

    setIsDeleting(true)
    // TODO: Implement account deletion
    // This should:
    // 1. Delete all user data from database
    // 2. Revoke all sessions
    // 3. Sign out the user
    // 4. Redirect to home page

    console.log('Deleting account...')
    await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
    setIsDeleting(false)
    setShowDeleteDialog(false)
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
            <h1 className="text-3xl font-bold text-gray-900">Danger Zone</h1>
            <p className="text-gray-600 mt-1">Irreversible and destructive actions</p>
          </div>
        </div>

        <Card className="bg-white border-gray-200 border-red-200">
          <CardHeader>
            <CardTitle className="text-gray-900 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Delete Account
            </CardTitle>
            <CardDescription className="text-gray-600">
              Once you delete your account, there is no going back
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <h4 className="text-red-600 font-medium mb-2">What will be deleted:</h4>
                <ul className="text-gray-700 text-sm space-y-1 list-disc list-inside">
                  <li>Your mentor profile and all associated information</li>
                  <li>All booking sessions you've created</li>
                  <li>All bookings with mentees (both past and upcoming)</li>
                  <li>Your wallet addresses and authentication data</li>
                  <li>All payment transaction records</li>
                </ul>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                <h4 className="text-yellow-600 font-medium mb-2">Please note:</h4>
                <ul className="text-gray-700 text-sm space-y-1 list-disc list-inside">
                  <li>This action is permanent and cannot be undone</li>
                  <li>Mentees with upcoming bookings will lose their sessions</li>
                  <li>Any committed payments may be affected (depending on smart contract)</li>
                </ul>
              </div>

              <Button
                variant="destructive"
                onClick={handleDeleteClick}
                className="w-full"
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete My Account'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="bg-white border-gray-200">
          <DialogHeader>
            <DialogTitle className="text-gray-900 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Delete Account
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              This action cannot be undone. This will permanently delete your account and remove all your data.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-gray-700 text-sm">
                To confirm, please type the following text exactly:
              </p>
              <p className="text-red-600 font-mono font-bold mt-2">
                I delete this account
              </p>
            </div>

            <div className="space-y-2">
              <Input
                type="text"
                value={confirmationText}
                onChange={(e) => setConfirmationText(e.target.value)}
                placeholder='Type "I delete this account"'
                className="bg-white border-gray-300 text-gray-900"
                disabled={isDeleting}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={confirmationText !== 'I delete this account' || isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete Account'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
