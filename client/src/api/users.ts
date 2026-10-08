import { apiFetch } from '@/lib/api'
import type { User } from '@/types'

export type UpdateProfilePayload = {
  name: string
  bio?: string
  avatarUrl?: string
}

export type UpdateProfileResponse = {
  user: User
  message?: string
}

export const updateUserProfile = async (
  payload: UpdateProfilePayload,
  token?: string | null
): Promise<UpdateProfileResponse> => {
  return apiFetch<UpdateProfileResponse>('/users/profile', {
    method: 'PUT',
    body: JSON.stringify(payload),
    token,
  });
};