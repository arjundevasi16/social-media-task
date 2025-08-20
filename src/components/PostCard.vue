<template>
  <div class="bg-white dark:bg-gray-800 rounded-xl shadow-md p-5 flex flex-col transition-colors">
    <header class="flex mb-2 justify-between">
      <div class="flex flex-col mb-2">
        <div class="text-sm font-semibold text-gray-800 dark:text-white">
          {{ post.user?.userName || 'Anonymous' }}
        </div>
        <div class="text-xs text-gray-400">
          {{ useFormatDate(post.createdAt).date }}
        </div>
      </div>
      <div v-if="isPostAuthor" class="relative" ref="actionsMenuRef">
        <button
          @click="toggleActionsMenu"
          class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
        >
          <i class="ri-more-2-fill"></i>
        </button>
        <div
          v-if="showActionsMenu"
          class="absolute right-0 top-5 mb-2 w-32 bg-white dark:bg-gray-700 rounded-md shadow-lg z-10 overflow-hidden"
        >
          <button
            @click="$emit('edit', post)"
            class="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
          >
            <i class="ri-edit-line mr-2"></i> Edit
          </button>
          <button
            @click="$emit('delete', post)"
            class="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
          >
            <i class="ri-delete-bin-line mr-2"></i> Delete
          </button>
        </div>
      </div>
    </header>

    <div class="flex-grow mb-4">
      <h2 class="text-lg font-semibold text-gray-800 dark:text-white">{{ post.title }}</h2>
      <p
        class="text-sm text-gray-600 dark:text-gray-300"
        :class="{ 'line-clamp-2': !isExpanded && isLongDescription, 'mb-2': isLongDescription }"
      >
        {{ post.description }}
      </p>

      <button
        v-if="isLongDescription && !isExpanded"
        @click="isExpanded = true"
        class="text-blue-500 text-xs hover:underline self-start mt-1"
      >
        View More
      </button>

      <button
        v-if="isExpanded"
        @click="isExpanded = false"
        class="text-blue-500 text-xs hover:underline self-start mt-1"
      >
        View Less
      </button>
    </div>

    <footer
      class="flex justify-between items-center border-t border-gray-200 dark:border-gray-700 pt-4"
    >
      <div class="flex items-center gap-4 text-gray-500 dark:text-gray-400">
        <button
          @click="toggleLike('post')"
          :disabled="isLiking"
          class="flex items-center gap-1 transition cursor-pointer"
          :class="{ 'opacity-50 cursor-not-allowed': isLiking }"
        >
          <i class="ri-heart-fill" :class="{ 'text-red-500': post.isLiked }"></i>
          <span class="text-sm">{{ post.likesCount }}</span>
        </button>

        <button
          class="flex items-center gap-1 hover:text-blue-500 transition cursor-pointer"
          @click="$emit('viewComments', post)"
        >
          <i class="ri-chat-3-line"></i>
          <span class="text-sm">{{ post.commentsCount }}</span>
        </button>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { useAuth } from '@/stores/useAuth'
import { computed, ref, onMounted, onUnmounted } from 'vue'
import type { postSchema } from '@/types/postType'
import { usePostStore } from '@/stores/usePost'
import { useFormatDate } from '@/composables/useFormatDate'

const emit = defineEmits(['edit', 'delete', 'view', 'updated', 'viewComments'])

const props = defineProps<{
  post: postSchema
}>()

const store = useAuth()

const isExpanded = ref(false)

const isLongDescription = computed(() => props.post.description.length > 350)
const isPostAuthor = computed(() => {
  return store.userId && store.userId === props.post.user?._id
})

const isLiking = ref(false)
const showActionsMenu = ref(false)
const actionsMenuRef = ref<HTMLElement | null>(null)
const toggleActionsMenu = () => {
  showActionsMenu.value = !showActionsMenu.value
}
const closeActionsMenu = () => {
  showActionsMenu.value = false
}
const handleDocumentClick = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  if (actionsMenuRef.value && !actionsMenuRef.value.contains(target)) {
    closeActionsMenu()
  }
}
onMounted(() => {
  document.addEventListener('click', handleDocumentClick)
})
onUnmounted(() => {
  document.removeEventListener('click', handleDocumentClick)
})

async function toggleLike(type: string) {
  if (isLiking.value) return
  isLiking.value = true
  try {
    await usePostStore().toggleLike(props.post._id, type)
  } catch (error) {
    console.error('Failed to toggle like:', error)
  } finally {
    isLiking.value = false
  }
}
</script>

<style scoped>
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
