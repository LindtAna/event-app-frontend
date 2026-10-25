import { apiFetch } from '@/lib/api'
import type { Event } from '@/types'

export type EventPayload = {
  title: string
  description: string
  imageUrl: string
  location: string
  startDateTime: string
  endDateTime: string
  categoryId?: string
  categoryName?: string
  url: string
}

export const getAllEvents = async (): Promise<Event[]> => {
  return apiFetch<Event[]>('/events');
}

export const getOrganizedEvents = async (userId: number): Promise<Event[]> => {
  return apiFetch<Event[]>(`/events?ownerId=${userId}`);
}

export const getEventById = async (
  id: string,
  token?: string | null,
): Promise<Event> => {
  return apiFetch<Event>(`/events/${id}`, {
    token,
  })
}

export const createEvent = async (
  payload: EventPayload,
  token: string,
): Promise<Event> => {
  return apiFetch<Event>('/events', {
    method: 'POST',
    body: JSON.stringify(payload),
    token,
  })
}

export const updateEvent = async (
  eventId: string,
  payload: EventPayload,
  token: string,
): Promise<Event> => {
  return apiFetch<Event>(`/events/${eventId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
    token,
  })
}

export const deleteEvent = async (eventId: number | string, token?: string | null): Promise<void> => {
  return apiFetch<void>(`/events/${eventId}`,
    {
    method: 'DELETE',
    token,
  })
}