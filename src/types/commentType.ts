export interface User {
  _id: string
  userName: string
}

export interface Comment {
  _id: string
  userId: User
  postId: string
  commentId?: string
  parentReplyId?: string
  text: string
  likesCount: number
  repliesCount: number
  isRemoved: boolean
  deletedAt: string | null
  createdAt: string
  updatedAt: string
  isLiked: boolean
  replies?: Comment[] // for top-level replies
  nestedReplies?: Comment[] // API gives sometimes
  totalReplies?: number
}
