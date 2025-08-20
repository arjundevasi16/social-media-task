<template>
  <nav
    class="bg-white dark:bg-gray-900 shadow-sm fixed w-full top-0 z-50"
    v-if="store.isAuthenticated"
  >
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between h-16 items-center">
        <div class="flex-shrink-0 text-xl font-bold text-blue-600 dark:text-blue-400">
          SocialApp
        </div>

        <div class="hidden md:flex items-center space-x-6">
          <RouterLink
            to="/"
            class="text-gray-700 dark:text-gray-200 hover:text-blue-500 transition-colors"
          >
            Home
          </RouterLink>

          <span v-if="store.userName" class="text-gray-700 dark:text-gray-200">
            Welcome, {{ store.userName }}
          </span>

          <button @click="toggleTheme" class="ml-4 text-xl">
            <span v-if="isDark">🌙</span>
            <span v-else>☀️</span>
          </button>

          <button
            @click="logout"
            class="ml-2 text-xl text-gray-700 dark:text-gray-200 hover:text-red-500 transition"
            title="Logout"
          >
            <i class="ri-logout-box-r-line"></i>
          </button>
        </div>

        <div class="md:hidden">
          <button @click="isOpen = !isOpen" class="text-gray-700 dark:text-gray-200">
            <svg
              v-if="!isOpen"
              xmlns="http://www.w3.org/2000/svg"
              class="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
            <svg
              v-else
              xmlns="http://www.w3.org/2000/svg"
              class="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <div v-if="isOpen" class="md:hidden px-4 pt-2 pb-4 space-y-2 bg-white dark:bg-gray-900">
      <RouterLink @click="isOpen = false" to="/" class="block text-gray-700 dark:text-gray-200"
        >Home</RouterLink
      >
      <RouterLink
        @click="isOpen = false"
        to="/explore"
        class="block text-gray-700 dark:text-gray-200"
        >Explore</RouterLink
      >
      <RouterLink
        @click="isOpen = false"
        to="/profile"
        class="block text-gray-700 dark:text-gray-200"
        >Profile</RouterLink
      >
      <RouterLink
        @click="isOpen = false"
        to="/my-posts"
        class="block text-gray-700 dark:text-gray-200"
        >My Posts</RouterLink
      >

      <span v-if="store.userName" class="block text-gray-700 dark:text-gray-200 mt-2">
        Welcome, {{ store.userName }}
      </span>

      <button @click="toggleTheme" class="flex items-center gap-2 text-xl pt-2">
        <span v-if="isDark">🌙 Dark</span>
        <span v-else>☀️ Light</span>
      </button>

      <button @click="logout" class="flex items-center gap-2 text-red-500 pt-2">
        <i class="ri-logout-box-r-line"></i> Logout
      </button>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { useAuth } from '@/stores/useAuth'
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

let router = useRouter()
const isOpen = ref(false)
const isDark = ref(false)
let store = useAuth()

const toggleTheme = () => {
  isDark.value = !isDark.value
  document.documentElement.classList.toggle('dark', isDark.value)
  localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
}

const logout = () => {
  store.logout()
  router.push('/login')
}

onMounted(() => {
  const saved = localStorage.getItem('theme')
  isDark.value =
    saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)
  if (isDark.value) {
    document.documentElement.classList.add('dark')
  }
})
</script>
