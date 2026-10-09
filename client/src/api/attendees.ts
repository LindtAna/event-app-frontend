
import { apiFetch } from '@/lib/api'
import type { Attendee, User } from '@/types'

export const getEventAttendees = async (
  eventId: number | string
): Promise<User[]> => {
  return apiFetch<User[]>(`/events/${eventId}/attendees`)
}

export const addEventAttendee = async (
  eventId: number | string,
  userId: number,
  token: string
): Promise<Attendee> => {
  return apiFetch<Attendee>(
    `/events/${eventId}/attendees/${userId}`,
    {
      method: 'POST',
      token,
    }
  )
}