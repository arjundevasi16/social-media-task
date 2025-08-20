import { api } from '@/services/api'

import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export const useAuth = defineStore(
  'auth',
  () => {
    let token = ref<null | string>(null)
    let isLoading = ref(false)
    let userName = ref(null)
    let userId = ref(null)
    const isAuthenticated = computed(() => !!token.value)

    const login = async (payload: { userName: string; password: string }) => {
      try {
        isLoading.value = true
        const response = await api.post('/auth/login', payload)
        token.value = response.data.data.token
        userName.value = response.data.data.userName
        userId.value = response.data.data._id
      } catch (error) {
        console.error('Login error:', error)
        throw error
      } finally {
        isLoading.value = false
      }
    }

    const signup = (name: string, email: string, password: string) => {}

    const logout = () => {
      token.value = null
      userName.value = null
      userId.value = null
    }

    return {
      token,
      isAuthenticated,
      isLoading,
      login,
      signup,
      logout,
      userName,
      userId,
    }
  },
  {
    persist: true,
  },
)
