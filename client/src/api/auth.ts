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
