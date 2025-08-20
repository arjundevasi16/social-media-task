<template>
  <BaseModal name="editPost" title="Edit Post">
    <template #body>
      <div v-if="isLoading" class="p-4 text-center text-gray-500 dark:text-gray-400">
        <p>Loading post details...</p>
      </div>

      <form v-else-if="post" @submit.prevent="submit">
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
      </form>

      <div v-else class="p-4 text-center text-red-500">
        <p>Post not found or failed to load.</p>
      </div>
    </template>

    <template #footer>
      <button
        @click="modalStore.close()"
        class="px-4 py-2 bg-gray-300 dark:bg-gray-600 rounded hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
      >
        Cancel
      </button>

      <button
        type="submit"
        @click="submit"
        :disabled="formIsEmpty || isSubmitting || !post"
        :class="{ 'opacity-50 cursor-not-allowed': formIsEmpty || isSubmitting || !post }"
        class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
      >
        <span v-if="isSubmitting">Updating...</span>
        <span v-else>Update</span>
      </button>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { api } from '@/services/api'
import { useModalStore } from '@/stores/useModal'
import BaseModal from './BaseModal.vue'
import { toast } from 'vue3-toastify'
import 'vue3-toastify/dist/index.css'
import type { postSchema } from '@/types/postType'
const props = defineProps<{ postId: string | null }>()
const emit = defineEmits<{ (e: 'updated'): void }>()

const title = ref('')
const description = ref('')

const post = ref<postSchema | null>(null)
const isLoading = ref(false)
const isSubmitting = ref(false)

const modalStore = useModalStore()

const formIsEmpty = computed(() => !title.value.trim() || !description.value.trim())

watch(
  [() => props.postId, () => modalStore.isOpen('editPost')],
  async ([id, isOpen]) => {
    if (id && isOpen) {
      isLoading.value = true
      try {
        const res = await api.get(`/posts/post/${id}`)
        post.value = res.data.data
        if (post.value) {
          title.value = post.value.title
          description.value = post.value.description
        }
      } catch (error) {
        console.error('Failed to fetch post:', error)
        post.value = null
      } finally {
        isLoading.value = false
      }
    } else if (!isOpen) {
      post.value = null
      title.value = ''
      description.value = ''
    }
  },
  { immediate: true },
)

const submit = async () => {
  if (!props.postId || formIsEmpty.value || isSubmitting.value) {
    return
  }

  isSubmitting.value = true
  try {
    await api.put(`/posts/update/${props.postId}`, {
      title: title.value,
      description: description.value,
    })
    toast.success('Post updated successfully!')
    emit('updated')
    modalStore.close()
  } catch (error: any) {
    console.error('Failed to update post:', error)
    toast.error(error.response?.data?.message || 'Failed to update post. Please try again.')
  } finally {
    isSubmitting.value = false
  }
}
</script>
