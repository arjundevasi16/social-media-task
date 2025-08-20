import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from '@/services/api'
import type { postSchema } from '@/types/postType'

export const usePostStore = defineStore('post', () => {
  const posts = ref<postSchema[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const limit = ref(10)
  const totalPost = ref(0)
  const page = ref(1)
  const hasMorePosts = ref(true)

  const fetchPosts = async (append: boolean = false) => {
    if (isLoading.value || (!hasMorePosts.value && append)) return

    isLoading.value = true
    error.value = null
    try {
      const currentPage = append ? page.value + 1 : 1
      const res = await api.get('posts/list-post', {
        params: {
          page: currentPage,
          limit: limit.value,
        },
      })
      const data = res.data.data
      if (append) {
        page.value += 1
        posts.value.push(...data.posts)
      } else {
        posts.value = data.posts
        page.value = 1
      }
      totalPost.value = data.totalPosts
      hasMorePosts.value = posts.value.length < totalPost.value
    } catch (err: any) {
      error.value = err?.response?.data?.message || 'Failed to load posts'
    } finally {
      isLoading.value = false
    }
  }
  const toggleLike = async (postId: string, type: string) => {
    const postIndex = posts.value.findIndex((post) => {
      return post._id === postId
    })
    if (postIndex === -1) {
      console.error('Post not found in store:', postId)
      return
    }
    const postToUpdate = posts.value[postIndex]
    const originalIsLiked = postToUpdate.isLiked
    const originalLikesCount = postToUpdate.likesCount

    postToUpdate.isLiked = !postToUpdate.isLiked
    postToUpdate.likesCount += postToUpdate.isLiked ? 1 : -1
    try {
      await api.post('/likes/like-unlike', { targetId: postId, type: type })
    } catch (error) {
      console.error('Failed to toggle like:', error)
      postToUpdate.isLiked = originalIsLiked
      postToUpdate.likesCount = originalLikesCount
      throw error
    }
  }
  const refreshPosts = () => {
    posts.value = []
    page.value = 1
    hasMorePosts.value = true
    fetchPosts()
  }

  return {
    posts,
    isLoading,
    error,
    hasMorePosts,
    fetchPosts,
    refreshPosts,
    toggleLike,
  }
})
