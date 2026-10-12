
import { apiFetch } from '@/lib/api'
import type { Attendee, Event, User } from '@/types'

export const getEventAttendees = async (
  eventId: number | string
): Promise<User[]> => {
  return apiFetch<User[]>(`/events/${eventId}/attendees`)
}

export const getEventsByAttendee = async (
  userId: number
): Promise<Event[]> => {
  return apiFetch<Event[]>(`/attendees/${userId}/events`)
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

export const leaveEvent = async (
  eventId: number | string,
  userId: number,
  token: string
): Promise<void> => {
  return apiFetch<void>(
    `/events/${eventId}/attendees/${userId}`,
    {
      method: 'DELETE',
      token,
    }
  )
}

