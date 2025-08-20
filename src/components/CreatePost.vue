<template>
  <BaseModal name="createPost" title="Create Post">
    <template #body>
      <div class="mb-4">
        <label class="block mb-1 text-gray-700 dark:text-gray-300">Title</label>
        <input
          v-model="title"
          type="text"
          class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:text-white"
          placeholder="Enter title"
        />
      </div>
      <div class="mb-4">
        <label class="block mb-1 text-gray-700 dark:text-gray-300">Description</label>
        <textarea
          v-model="description"
          class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:text-white"
          placeholder="Enter description"
          rows="4"
        ></textarea>
      </div>
    </template>
    <template #footer>
      <button
        @click="modalStore.close()"
        class="px-4 py-2 bg-gray-300 dark:bg-gray-600 rounded hover:bg-gray-400 dark:hover:bg-gray-500"
      >
        Cancel
      </button>
      <button
        @click="submit"
        :disabled="formIsEmpty || isSubmitting"
        :class="{ 'opacity-50 cursor-not-allowed': formIsEmpty || isSubmitting }"
        class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
      >
        <span v-if="isSubmitting">Creating...</span>
        <span v-else>Create</span>
      </button>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import BaseModal from './BaseModal.vue'
import { useModalStore } from '@/stores/useModal'
import { api } from '@/services/api'
import { toast } from 'vue3-toastify'
import 'vue3-toastify/dist/index.css'

const modalStore = useModalStore()
const emit = defineEmits<{ (e: 'created'): void }>()

const title = ref('')
const description = ref('')
const isSubmitting = ref(false)
const formIsEmpty = computed(() => !title.value.trim() || !description.value.trim())

const submit = async () => {
  if (formIsEmpty.value || isSubmitting.value) {
    return
  }
  isSubmitting.value = true
  try {
    const res = await api.post('/posts/create-post', {
      title: title.value,
      description: description.value,
    })
    toast.success(res.data?.message || 'Post created successfully!')
    emit('created')
    title.value = ''
    description.value = ''
    modalStore.close()
  } catch (error: any) {
    toast.error(error.response?.data?.message || 'Failed to create post. Please try again.')
    console.error('Failed to create post:', error)
  } finally {
    isSubmitting.value = false
  }
}
</script>
