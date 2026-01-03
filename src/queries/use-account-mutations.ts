import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'

export function useDeleteAccount() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/account', {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete account')
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.clear()

      navigate({ to: '/login' })
    },
  })
}
