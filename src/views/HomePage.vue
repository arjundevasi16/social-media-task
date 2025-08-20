<template>
  <div class="min-h-screen bg-gray-100 py-10 px-4">
    <div class="max-w-4xl mx-auto flex justify-end mb-6">
      <button
        @click="modalStore.open('createPost')"
        class="btn bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
      >
        <i class="ri-add-line"></i> Create Post
      </button>
    </div>

    <CreatePostModal @created="refreshPosts" v-if="modalStore.isOpen('createPost')" />
    <EditPostModal
      :postId="selectedPostId"
      @updated="refreshPosts"
      v-if="modalStore.isOpen('editPost')"
    />
    <DeletePostModal
      :postId="selectedPostId"
      @deleted="refreshPosts"
      v-show="modalStore.isOpen('deletePost')"
    />
    <CommentModal :post="postData" v-if="modalStore.isOpen('commentOnPost')" />

    <div class="max-w-4xl mx-auto grid gap-6">
      <PostCard
        v-for="post in postStore.posts"
        :key="post._id"
        :post="post"
        @edit="openEdit(post)"
        @delete="openDelete(post)"
        @updated="refreshPosts"
        @viewComments="openCommentModal(post)"
      />
    </div>
    <div ref="endOfFeed" class="text-center py-4">
      <div v-if="postStore.isLoading && postStore.hasMorePosts" class="text-gray-500">
        <i class="ri-loader-4-line text-2xl animate-spin"></i>
        <p>Loading more posts...</p>
      </div>
      <div v-else-if="!postStore.hasMorePosts" class="text-gray-400">
        You've reached the end of the feed.
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { usePostStore } from '@/stores/usePost'
import { useModalStore } from '@/stores/useModal'
import { usePostActions } from '@/composables/usePostActions'
import { useInfiniteScroll } from '@vueuse/core'
import PostCard from '@/components/PostCard.vue'
import CreatePostModal from '@/components/CreatePost.vue'
import EditPostModal from '@/components/EditPostForm.vue'
import DeletePostModal from '@/components/DeleteConfirm.vue'
import CommentModal from '@/components/CommentModal.vue'

const { selectedPostId, postData, openEdit, openDelete, openCommentModal, refreshPosts } =
  usePostActions()
const endOfFeed = ref<HTMLElement | null>(null)
const postStore = usePostStore()
const modalStore = useModalStore()

onMounted(refreshPosts)
useInfiniteScroll(
  endOfFeed,
  async () => {
    if (postStore.hasMorePosts) await postStore.fetchPosts(true)
  },
  { distance: 10 },
)
</script>
