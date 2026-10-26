import { apiFetch } from '@/lib/api'
import type { Category } from '@/types'

export const getCategories = async (token: string): Promise<Category[]> => {
  return apiFetch<Category[]>('/categories', {token})
}