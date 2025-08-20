<template>
  <BaseModal name="deletePost" title="Delete Post">
    <template #body>
      <div v-if="isLoading" class="p-4 text-center text-gray-500 dark:text-gray-400">
        <p>Fetching post details...</p>
      </div>

      <div v-else>
        <p v-if="postTitle" class="mb-4 text-gray-700 dark:text-gray-300">
          Are you sure you want to delete <strong>"{{ postTitle }}"</strong>? This action cannot be
          undone.
        </p>
        <p v-else class="mb-4 text-red-500">
          Post details failed to load. Are you sure you want to delete this post? This action cannot
          be undone.
        </p>
      </div>
    </template>

    <template #footer>
      <div class="flex justify-end gap-2">
        <button
          @click="modalStore.close()"
          class="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 transition-colors"
          :disabled="isDeleting"
        >
          Cancel
        </button>

        <!-- Delete button -->
        <button
          @click="deletePost"
          :disabled="isDeleting || !props.postId"
          :class="{ 'opacity-50 cursor-not-allowed': isDeleting }"
          class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
        >
          <span v-if="isDeleting">Deleting...</span>
          <span v-else>Delete</span>
        </button>
      </div>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { api } from '@/services/api'
import { useModalStore } from '@/stores/useModal'
import BaseModal from './BaseModal.vue'
import { toast } from 'vue3-toastify'
import 'vue3-toastify/dist/index.css'

const props = defineProps<{ postId: string | null }>()
const emit = defineEmits<{ (e: 'deleted'): void }>()

const modalStore = useModalStore()
const postTitle = ref('')
const isLoading = ref(false)
const isDeleting = ref(false)

watch(
  [() => props.postId, () => modalStore.isOpen('deletePost')],
  async ([id, isOpen]) => {
    if (id && isOpen) {
      isLoading.value = true
      try {
        const res = await api.get(`/posts/post/${id}`)
        postTitle.value = res.data.data.title
      } catch (error) {
        console.error('Failed to fetch post details for deletion:', error)
        postTitle.value = ''
      } finally {
        isLoading.value = false
      }
    } else if (!isOpen) {
      postTitle.value = ''
    }
  },
  { immediate: true },
)

const deletePost = async () => {
  if (!props.postId || isDeleting.value) return

  isDeleting.value = true
  try {
    const res = await api.delete(`/posts/delete/${props.postId}`)
    toast.success(res.data?.message || 'Post deleted successfully!')
    emit('deleted')
    modalStore.close()
  } catch (error: any) {
    console.error('Failed to delete post:', error)
    toast.error(error.response?.data?.message || 'Failed to delete post. Please try again.')
  } finally {
    isDeleting.value = false
  }
}
</script>
