<template>
  <BaseModal name="commentOnPost" :title="modalTitle">
    <template #body>
      <div class="max-h-[70vh] overflow-y-auto pr-4">
        <PostCard
          v-if="post"
          :post="post"
          @edit="openEdit"
          @delete="openDelete"
          @updated="refreshPosts"
          class="mb-4"
        />

        <div v-if="isLoadingInitial" class="p-4 text-center text-gray-500 dark:text-gray-400">
          <i class="ri-loader-4-line text-4xl animate-spin"></i>
          <p>Loading comments...</p>
        </div>

        <div
          v-else-if="comments.length === 0"
          class="p-4 text-center text-gray-500 dark:text-gray-400"
        >
          No comments yet. Be the first to start a conversation!
        </div>

        <div v-else class="space-y-4">
          <CommentItem
            v-for="comment in comments"
            :key="comment._id"
            :comment="comment"
            @toggle-like-comment="(payload) => toggleLike(payload.id, payload.type)"
            @comment-reply="(payload) => commentReply(payload)"
            @load-more-reply="(payload) => loadMoreReply(payload)"
            @delete-comment="(id) => deleteComment(id)"
            @delete-reply="(id) => deleteReply(id)"
          />
          <div v-if="hasMoreComments" class="text-center mt-4">
            <button
              v-if="post?._id"
              @click="fetchComments(post._id, true)"
              :disabled="isLoadingMore"
              class="px-4 py-2 text-sm font-semibold text-blue-500 hover:text-blue-600"
            >
              <span v-if="isLoadingMore">Loading more...</span>
              <span v-else>Load more comments</span>
            </button>
          </div>
        </div>
      </div>
    </template>

    <template #footer>
      <div class="flex items-center space-x-2 w-full">
        <input
          v-model="newCommentText"
          type="text"
          placeholder="Write a comment..."
          class="flex-grow p-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          @keyup.enter="submitComment"
        />
        <button
          @click="submitComment"
          :disabled="isSubmitting || !newCommentText.trim()"
          class="px-4 py-2 font-semibold rounded-md text-white bg-blue-500 hover:bg-blue-600 transition-colors disabled:bg-gray-400"
        >
          <i v-if="isSubmitting" class="ri-loader-4-line animate-spin"></i>
          <span v-else>Post</span>
        </button>
      </div>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

import { usePostActions } from '@/composables/usePostActions'
import { useModalStore } from '@/stores/useModal'
import { useCommentActions } from '@/composables/useCommentActions'

import BaseModal from '@/components/BaseModal.vue'
import CommentItem from '@/components/CommentItem.vue'
import PostCard from '@/components/PostCard.vue'
import type { postSchema } from '@/types/postType'

const { openEdit, openDelete, refreshPosts } = usePostActions()
const {
  isLoadingInitial,
  isLoadingMore,
  fetchComments,
  comments,
  hasMoreComments,
  addComment,
  toggleLike,
  commentReply,
  loadMoreReply,
  deleteComment,
  deleteReply,
} = useCommentActions()

const props = defineProps<{ post: postSchema | null }>()

const newCommentText = ref('')
const isSubmitting = ref(false)

const modalStore = useModalStore()
const modalTitle = computed(() => `Comments on: ${props.post?.title || 'Post'}`)

async function submitComment() {
  const text = newCommentText.value.trim()
  if (!text || !props.post?._id) return

  isSubmitting.value = true
  try {
    await addComment({ postId: props.post._id, text: text })
    newCommentText.value = ''
  } catch (err) {
    console.error('Failed to post comment:', err)
  } finally {
    isSubmitting.value = false
  }
}

watch(
  [() => props.post?._id, () => modalStore.isOpen('commentOnPost')],
  ([id, isOpen]) => {
    if (id && isOpen) {
      fetchComments(id)
    } else if (!isOpen) {
      comments.value = []
    }
  },
  { immediate: true },
)
</script>
