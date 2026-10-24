import { apiFetch } from "@/lib/api"
import type { User } from "@/types"

export type LoginPayload = {
  email: string
  password: string
}

export type LoginResponse = {
  user: User
  accessToken: string
}

export const loginUser = async (
  payload: LoginPayload,
): Promise<LoginResponse> => {
  return apiFetch<LoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  })
}

type RegisterBasePayload = {
  name: string
  email: string
  password: string
  avatarUrl?: string
  bio?: string
}

export type RegisterPayload =
  | (RegisterBasePayload & {
      registrationType: "owner"
      companyName: string
    })
  | (RegisterBasePayload & {
      registrationType: "member"
      invitationCode: string
    })

export const registerUser = async (
  payload: RegisterPayload,
): Promise<User> => {
  return apiFetch<User>("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  })
}