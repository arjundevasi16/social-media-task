// src/services/api.ts
import { useAuth } from '@/stores/useAuth'
import axios from 'axios'

export const api = axios.create({
  baseURL: 'https://social-media-backend-bwrz.onrender.com', // <-- update to your backend URL
  headers: {
    'Content-Type': 'application/json',
  },
})
api.interceptors.request.use(
  (config) => {
    const auth = useAuth()
    const token = auth.token

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)
