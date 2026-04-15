import axios from 'axios'

export const api = axios.create({
  baseURL: '/api',
  withCredentials: false
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('koreventas.accessToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})
