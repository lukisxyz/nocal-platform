import { createFileRoute } from '@tanstack/react-router'
import { authMiddleware } from '@/lib/auth-middleware'
import { Link } from '@tanstack/react-router'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
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
import { useDeleteAccount } from '@/queries/use-account-mutations'
import { deleteAccountSchema, type DeleteAccountFormData } from '@/lib/validations'
import { toast } from 'sonner'

export const Route = createFileRoute('/dashboard/danger-zone')({
  component: RouteComponent,
  server: {
    middleware: [authMiddleware],
  },
})

function RouteComponent() {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const deleteAccountMutation = useDeleteAccount()

  const form = useForm<DeleteAccountFormData>({
    resolver: zodResolver(deleteAccountSchema),
    defaultValues: {
      confirmation: '',
    },
  })

  const { register, handleSubmit, formState: { errors }, reset } = form

  const handleDeleteClick = () => {
    setShowDeleteDialog(true)
  }

  const onSubmit = handleSubmit(async (data) => {
    try {
      await deleteAccountMutation.mutateAsync()
      setShowDeleteDialog(false)
      toast.success('Account deleted successfully')
      reset()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete account')
    }
  })

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
                disabled={deleteAccountMutation.isPending}
              >
                {deleteAccountMutation.isPending ? 'Deleting...' : 'Delete My Account'}
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
                placeholder='Type "I delete this account"'
                className="bg-white border-gray-300 text-gray-900"
                disabled={deleteAccountMutation.isPending}
                {...register('confirmation')}
              />
              {errors.confirmation && (
                <p className="text-sm text-destructive">{errors.confirmation.message}</p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={deleteAccountMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={onSubmit}
              disabled={deleteAccountMutation.isPending}
            >
              {deleteAccountMutation.isPending ? 'Deleting...' : 'Delete Account'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
