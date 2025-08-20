import { api } from '@/services/api'
import { ref } from 'vue'
import type { Comment } from '@/types/commentType'
import { usePostStore } from '@/stores/usePost'

export function useCommentActions() {
  const comments = ref<Comment[]>([])
  const page = ref(1)
  const limit = ref(5)
  const repliesPage = ref(1)
  const repliesLimit = ref(3)

  const hasMoreComments = ref(true)
  const totalComments = ref(0)

  const isLoadingInitial = ref(false)
  const isLoadingMore = ref<boolean>(false)
  const error = ref<string | null>(null)

  const fetchComments = async (id: string, append = false) => {
    if ((append && isLoadingMore.value) || (!append && isLoadingInitial.value)) return
    if (append && !hasMoreComments.value) return

    if (append) {
      isLoadingMore.value = true
    } else {
      isLoadingInitial.value = true
    }

    error.value = null
    try {
      const res = await api.get(`/comments/get-comments/${id}`, {
        params: {
          page: append ? page.value + 1 : 1,
          limit: limit.value,
          repliesPage: repliesPage.value,
          repliesLimit: repliesLimit.value,
        },
      })
      const data = res.data.data
      const newComments = data.commentsTree
      if (append) {
        comments.value.push(...newComments)
        page.value += 1
      } else {
        comments.value = newComments
        page.value = 1
      }

      totalComments.value = data.totalComments
      hasMoreComments.value = comments.value.length < totalComments.value
    } catch (err: any) {
      error.value = err?.response?.data?.message || 'Failed to load comments'
    } finally {
      if (append) {
        isLoadingMore.value = false
      } else {
        isLoadingInitial.value = false
      }
    }
  }
  function findComment(list: Comment[], id: string): Comment | null {
    for (const comment of list) {
      if (comment._id === id) return comment

      if (comment.replies && comment.replies.length > 0) {
        const found = findComment(comment.replies, id)
        if (found) return found
      }

      if (comment.nestedReplies && comment.nestedReplies.length > 0) {
        const found = findComment(comment.nestedReplies, id)
        if (found) return found
      }
    }
    return null
  }

  const toggleLike = async (postId: string, type: string) => {
    const commentToUpdate = findComment(comments.value, postId)

    if (!commentToUpdate) {
      console.error('Comment/Reply not found in store:', postId)
      return
    }

    // optimistic update
    const originalIsLiked = commentToUpdate.isLiked
    const originalLikesCount = commentToUpdate.likesCount

    commentToUpdate.isLiked = !commentToUpdate.isLiked
    commentToUpdate.likesCount += commentToUpdate.isLiked ? 1 : -1

    try {
      await api.post('/likes/like-unlike', { targetId: postId, type })
    } catch (error) {
      console.error('Failed to toggle like:', error)
      commentToUpdate.isLiked = originalIsLiked
      commentToUpdate.likesCount = originalLikesCount
    }
  }

  const commentReply = async (payload: {
    postId: string
    text: string
    commentId: string
    parentReplyId?: string
  }) => {
    const res = await api.post('replies/add-reply', payload)
  }
  const loadMoreReply = async (payload: { commentId: string; parentReplyId?: string }) => {
    const id = payload.parentReplyId ?? payload.commentId

    const parentComment = findComment(comments.value, id)
    const currentRepliesCount =
      parentComment?.replies?.length ?? parentComment?.nestedReplies?.length ?? 0
    const nextPage = Math.floor(currentRepliesCount / repliesLimit.value) + 1

    try {
      const params = {
        commentId: payload.commentId,
        parentReplyId: payload.parentReplyId,
        page: nextPage,
        limit: repliesLimit.value,
      }
      const res = await api.get('/comments/load-more-replies', {
        params,
      })
      const newReplies = res.data.data.replies
      if (parentComment) {
        if (parentComment.commentId === undefined) {
          parentComment.replies ||= []
          parentComment?.replies.push(...newReplies)
        } else {
          parentComment.nestedReplies ||= []
          parentComment?.nestedReplies.push(...newReplies)
        }
      }
      repliesPage.value++
    } catch (error) {}
  }
  const addComment = async (payload: { postId: string; text: string }) => {
    try {
      const res = await api.post('comments/add-comment', payload)
      const newComment = res.data.data
      const commentWithUser = {
        ...newComment,
        userId: {
          ...newComment.userId,
          userName: 'you',
        },
      }
      const postIndex = usePostStore().posts.findIndex((post) => {
        return post._id === payload.postId
      })
      if (postIndex !== -1) {
        usePostStore().posts[postIndex].commentsCount++
      }
      comments.value.unshift(commentWithUser)
    } catch (error) {
      console.error('Failed to add comment:', error)
    }
  }
  const deleteComment = async (id: string) => {
    const res = await api.delete(`/comments/delete/${id}`)
  }
  const deleteReply = async (id: string) => {
    const res = await api.delete(`/replies/delete/${id}`)
  }
  return {
    comments,
    isLoadingInitial,
    isLoadingMore,
    hasMoreComments,
    addComment,
    fetchComments,
    loadMoreReply,
    toggleLike,
    commentReply,
    deleteComment,
    deleteReply,
  }
}
