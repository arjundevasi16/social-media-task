<template>
  <div class="flex flex-col space-y-2">
    <!-- Comment Wrapper -->
    <div class="flex items-start space-x-3">
      <div class="flex-1">
        <!-- Comment Bubble -->
        <div class="bg-gray-100 dark:bg-gray-700 rounded-2xl px-3 py-2 inline-block max-w-[90%]">
          <div class="text-sm font-semibold text-gray-800 dark:text-gray-200">
            {{ comment?.userId?.userName }}
          </div>
          <p v-if="comment.isRemoved" class="text-sm italic text-gray-400 dark:text-gray-500">
            This comment has been removed
          </p>
          <p v-else class="text-sm text-gray-700 dark:text-gray-300 leading-snug">
            {{ comment.text }}
          </p>
        </div>

        <!-- Actions -->
        <div class="flex items-center space-x-4 mt-1 text-xs text-gray-500 dark:text-gray-400">
          <button
            @click="likeComment"
            class="flex items-center gap-1"
            :class="{ 'text-red-500': comment.isLiked }"
            :disabled="isCommentLiking"
          >
            <i class="ri-heart-fill"></i>
            <span>{{ comment.likesCount }}</span>
          </button>
          <button @click="showReplyForm = !showReplyForm" class="hover:underline text-blue-500">
            Reply
          </button>
          <span>{{ useFormatDate(comment.createdAt).date }}</span>
          <button
            v-if="isCommentAuthor"
            class="hover:text-red-500"
            @click="
              comment.commentId
                ? emit('delete-reply', comment._id)
                : emit('delete-comment', comment._id)
            "
          >
            <i class="ri-delete-bin-line"></i>
          </button>
        </div>

        <!-- Reply Input -->
        <div v-if="showReplyForm" class="m-2 flex items-center gap-2">
          <input
            v-model="newReplyText"
            type="text"
            placeholder="Write a reply..."
            class="flex-grow p-2 text-sm rounded-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-blue-500"
            @keyup.enter="submitReply"
          />
          <button
            @click="submitReply"
            :disabled="!newReplyText.trim()"
            class="px-3 py-1 text-xs font-semibold rounded-full text-white bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400"
          >
            Send
          </button>
        </div>
      </div>
    </div>

    <!-- View Replies Button -->
    <div v-if="comment.repliesCount > 0" class="ml-6 relative">
      <div class="absolute left-0 top-0 bottom-0 w-px bg-gray-300 dark:bg-gray-600"></div>
      <button
        @click="showReplies = !showReplies"
        class="pl-3 text-xs font-medium text-blue-500 hover:underline"
      >
        {{
          showReplies
            ? 'Hide Replies'
            : `View ${comment.repliesCount} ${comment.repliesCount > 1 ? 'Replies' : 'Reply'}`
        }}
      </button>
    </div>

    <!-- Replies Section -->
    <div
      v-if="showReplies && (comment.replies || comment.nestedReplies)"
      class="ml-6 border-l border-gray-300 dark:border-gray-600 pl-3 space-y-2"
    >
      <CommentItem
        v-for="reply in replies"
        :key="reply?._id"
        :comment="reply"
        @toggle-like-comment="emit('toggle-like-comment', $event)"
        @comment-reply="emit('comment-reply', $event)"
        @load-more-reply="emit('load-more-reply', $event)"
        @delete-comment="emit('delete-comment', $event)"
        @delete-reply="emit('delete-reply', $event)"
      />
    </div>

    <!-- Load More Replies -->
    <div v-if="replies.length < comment.repliesCount && showReplies" class="ml-6 relative">
      <div class="absolute left-0 top-0 bottom-0 w-px bg-gray-300 dark:bg-gray-600"></div>
      <button
        @click="loadMoreReplies"
        class="pl-3 text-xs text-blue-500 hover:underline mt-1 text-start"
      >
        View {{ comment.repliesCount - (replies.length || 0) }} More Replies
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useFormatDate } from '@/composables/useFormatDate'
import type { Comment } from '@/types/commentType'
import { useAuth } from '@/stores/useAuth'

interface Payload {
  postId: string
  text: string
  commentId?: string
  parentId?: string
  parentReplyId?: string
}
const props = defineProps<{ comment: Comment }>()
const emit = defineEmits<{
  (e: 'toggle-like-comment', payload: { id: string; type: 'comment' | 'reply' }): void
  (e: 'comment-reply', payload: Payload): void
  (e: 'load-more-reply', payload: { commentId: string | undefined; parentId?: string }): void
  (e: 'delete-comment', id: string): void
  (e: 'delete-reply', id: string): void
}>()

const isCommentLiking = ref<boolean>(false)
const newReplyText = ref('')
const showReplyForm = ref(false)
const showReplies = ref(false)

const isCommentAuthor = computed(() => {
  return (
    (useAuth().userId === props.comment.userId._id || props.comment.userId.userName === 'You') &&
    !props.comment.isRemoved
  )
})

const replies = computed(() => {
  return props.comment.nestedReplies?.length
    ? props.comment.nestedReplies
    : props.comment.replies || []
})

async function likeComment() {
  emit('toggle-like-comment', {
    id: props.comment._id,
    type: props.comment.commentId ? 'reply' : 'comment',
  })
}

function submitReply() {
  if (!newReplyText.value.trim()) return
  const payload: Payload = {
    postId: props.comment.postId,
    commentId: props.comment.commentId ?? props.comment._id,
    text: newReplyText.value,
  }
  if (props.comment.commentId) {
    payload.parentReplyId = props.comment._id
  }
  emit('comment-reply', payload)
  newReplyText.value = ''
  showReplyForm.value = false
}

async function loadMoreReplies() {
  const payload: { commentId: string; parentReplyId?: string } = {
    commentId: '',
    parentReplyId: undefined,
  }
  if (props.comment.commentId) {
    payload.commentId = props.comment.commentId
    payload.parentReplyId = props.comment._id
  } else {
    payload.commentId = props.comment._id
  }
  emit('load-more-reply', payload)
}
</script>
