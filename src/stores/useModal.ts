import { defineStore } from 'pinia'
import { ref } from 'vue'
export const useModalStore = defineStore('modal', () => {
  const currentModal = ref<string | null>(null)
  const open = (name: string) => {
    currentModal.value = name
  }
  const close = () => {
    currentModal.value = null
  }
  const isOpen = (name: string) => {
    return currentModal.value === name
  }

  return { currentModal, open, close, isOpen }
})
