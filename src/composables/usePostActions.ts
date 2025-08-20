import { ref } from 'vue'
import { usePostStore } from '@/stores/usePost'
import { useModalStore } from '@/stores/useModal'
import type { postSchema } from '@/types/postType'

const selectedPostId = ref<string | null>(null)
const postData = ref<postSchema | null>(null)

export function usePostActions() {
  const postStore = usePostStore()
  const modalStore = useModalStore()

  const refreshPosts = () => postStore.refreshPosts()

  const openEdit = (post: postSchema) => {
    selectedPostId.value = post._id
    modalStore.open('editPost')
  }

  const openDelete = (post: postSchema) => {
    selectedPostId.value = post._id
    modalStore.open('deletePost')
  }

  const openCommentModal = (post: postSchema) => {
    postData.value = post
    modalStore.open('commentOnPost')
  }

  return {
    // data
    selectedPostId,
    postData,

    // actions
    openEdit,
    openDelete,
    openCommentModal,
    refreshPosts,
  }
}
