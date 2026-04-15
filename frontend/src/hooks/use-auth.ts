import { useState, useEffect, useCallback } from 'react'
import { api } from '@/lib/api'
import type { RegisterRequest, LoginRequest, AuthResponse } from '@/types/auth'

const TOKEN_KEY = 'koreventas.accessToken'

export function useAuth() {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isAuthenticated = !!token

  const saveToken = useCallback((t: string) => {
    localStorage.setItem(TOKEN_KEY, t)
    setToken(t)
  }, [])

  const register = useCallback(async (data: RegisterRequest) => {
    setLoading(true)
    setError(null)
    try {
      const res = await api.post<AuthResponse>('/auth/register', data)
      saveToken(res.data.accessToken)
      return res.data
    } catch {
      setError('Error al registrar. ¿El email ya existe?')
      throw new Error('register failed')
    } finally {
      setLoading(false)
    }
  }, [saveToken])

  const login = useCallback(async (data: LoginRequest) => {
    setLoading(true)
    setError(null)
    try {
      const res = await api.post<AuthResponse>('/auth/login', data)
      saveToken(res.data.accessToken)
      return res.data
    } catch {
      setError('Email o contraseña incorrectos')
      throw new Error('login failed')
    } finally {
      setLoading(false)
    }
  }, [saveToken])

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    setToken(null)
  }, [])

  // Interceptor para 401: auto-logout
  useEffect(() => {
    const id = api.interceptors.response.use(
      res => res,
      err => {
        if (err.response?.status === 401) logout()
        return Promise.reject(err)
      }
    )
    return () => api.interceptors.response.eject(id)
  }, [logout])

  return { isAuthenticated, token, loading, error, register, login, logout }
}
