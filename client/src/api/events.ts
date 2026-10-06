import { API_BASE_URL } from '@/lib/api'
import type { Event } from '@/types'

export const getOrganizedEvents = async (userId: number): Promise<Event[]> => {
  const response = await fetch(`${API_BASE_URL}/events?ownerId=${userId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', 
  })

  if (!response.ok) {
    throw new Error('Fehler beim Laden der Events')
  }

  return response.json()
}