import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

export interface Profile {
  id: string
  userId: string
  username: string
  name: string
  bio: string
  professionalField: string
  timezone: string
  createdAt: Date
  updatedAt: Date
}

export interface ProfileFormData {
  username: string
  name: string
  bio: string
  professionalField: string
  timezone: string
}

export function useProfile() {
  return useQuery<Profile | null>({
    queryKey: ['profile'],
    queryFn: async () => {
      const response = await fetch('/api/profile', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch profile')
      }

      return response.json()
    },
  })
}

export function useUpdateProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: ProfileFormData) => {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error('Failed to update profile')
      }

      return response.json()
    },
    onSuccess: (data) => {
      // Update the profile query cache with the updated data
      queryClient.setQueryData(['profile'], data)
      // Also invalidate to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['profile'] })
    },
  })
}
