<template>
  <div
    class="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-100 to-indigo-200 px-4"
  >
    <div class="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md space-y-6">
      <div class="text-center">
        <h1 class="text-3xl font-bold text-gray-800 mb-2">Create Account ✨</h1>
        <p class="text-sm text-gray-500">Join us by creating a new account</p>
      </div>

      <form @submit.prevent="handleSignup" class="space-y-4">
        <div>
          <label for="username" class="block mb-1 text-sm font-medium text-gray-700"
            >Username</label
          >
          <input
            type="text"
            id="username"
            v-model="username"
            required
            :disabled="store.isLoading"
            :class="`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 ${disabled}`"
            placeholder="username"
          />
        </div>

        <div>
          <label for="password" class="block mb-1 text-sm font-medium text-gray-700"
            >Password</label
          >
          <input
            type="password"
            id="password"
            v-model="password"
            required
            :disabled="store.isLoading"
            :class="`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 ${disabled}`"
            placeholder="********"
          />
        </div>

        <button
          type="submit"
          :disabled="store.isLoading"
          :class="`w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition font-semibold disabled:bg-gray-200 ${disabled}`"
        >
          Sign-up
        </button>
      </form>

      <div class="text-center text-sm text-gray-600">
        Already have an account?
        <RouterLink to="/login" class="text-blue-600 hover:underline font-medium">Login</RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { api } from '@/services/api'
import { useAuth } from '@/stores/useAuth'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { toast, type ToastOptions } from 'vue3-toastify'

const router = useRouter()
const username = ref('')
const password = ref('')
const disabled =
  'disabled:bg-gray-50 disabled:text-gray-500 disabled:shadow-none dark:disabled:border-gray-700'

const store = useAuth()
const handleSignup = async () => {
  store.isLoading = true
  try {
    const response = await api.post('/auth/sign-up', {
      userName: username.value,
      password: password.value,
    })

    toast.success('Signup successful! Redirecting...')
    router.push('Login')
  } catch (error: any) {
    if (error.response?.status === 409) {
      toast.error('User already exists.')
    } else {
      toast.error(error.response?.data?.message || 'Something went wrong.')
    }
  } finally {
    store.isLoading = false
  }
}

// Add your signup logic or API call here
</script>
