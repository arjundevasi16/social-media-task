export interface postSchema {
  _id: string
  title: string
  description: string
  user?: { userName: string; _id: string }
  createdAt: string
  likesCount: number
  commentsCount: number
  isLiked: boolean
}
