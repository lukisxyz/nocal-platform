import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { authClient } from '@/lib/auth-client'
import { toast } from 'sonner'

export function useSignOut() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: async () => {
      await authClient.signOut()
    },
    onSuccess: () => {
      queryClient.clear()

      toast.success('Signed out successfully')

      navigate({ to: '/login' })
    },
    onError: (_error) => {
      toast.error('Failed to sign out')
    },
  })
}
