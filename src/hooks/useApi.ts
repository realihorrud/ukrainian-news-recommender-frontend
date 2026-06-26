import { useAuth } from '@clerk/react'
import { useCallback } from 'react'

const API_URL = import.meta.env.VITE_API_URL

export function useApi() {
  const { getToken } = useAuth()

  const apiFetch = useCallback(
    async <T>(path: string, options: RequestInit = {}): Promise<T> => {
      const token = await getToken()
      const headers: Record<string, string> = {
        Authorization: `Bearer ${token}`,
      }

      if (options.body) {
        headers['Content-Type'] = 'application/json'
      }

      const response = await fetch(`${API_URL}${path}`, {
        ...options,
        headers: {
          ...headers,
          ...(options.headers as Record<string, string>),
        },
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      return response.json() as Promise<T>
    },
    [getToken],
  )

  return { apiFetch }
}
