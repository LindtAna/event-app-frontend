import { apiFetch } from "@/lib/api"
import type { Invitation } from "@/types";


export type CreateInvitationResponse = {
  invitation: Invitation
  invitationCode: string
}

export const getInvitations = (
  token: string,
): Promise<Invitation[]> => {
  return apiFetch<Invitation[]>("/invitations", {
    method: "GET",
    token,
  })
}

export const createInvitation = (
  expiresAt: string,
  token: string,
): Promise<CreateInvitationResponse> => {
  return apiFetch<CreateInvitationResponse>("/invitations", {
    method: "POST",
    body: JSON.stringify({ expiresAt }),
    token,
  })
}

export const revokeInvitation = (
  invitationId: number,
  token: string,
): Promise<void> => {
  return apiFetch<void>(`/invitations/${invitationId}`, {
    method: "DELETE",
    token,
  })
}

export const deleteInvitation = (
  invitationId: number,
  token: string,
): Promise<void> => {
  return apiFetch<void>(`/invitations/${invitationId}/permanent`, {
    method: "DELETE",
    token,
  })
}