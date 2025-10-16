"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/app/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Heart, MessageCircle, Trash2 } from "lucide-react"
import Link from "next/link"

interface User {
  id: number
  username: string
  profile_photo?: string
}

interface Comment {
  id: number
  content: string
  user: User
  likes_count: number
  is_liked: boolean
  created_at: string
}

interface Thread {
  id: number
  title: string
  content: string
  user: User
  comments: Comment[]
  likes_count: number
  is_liked: boolean
  created_at: string
}

export default function ThreadDetailPage() {
  const params = useParams()
  const router = useRouter()
  const threadId = params.id as string
  const { user, loading } = useAuth()
  const [thread, setThread] = useState<Thread | null>(null)
  const [threadLoading, setThreadLoading] = useState(true)
  const [commentContent, setCommentContent] = useState("")
  const [commenting, setCommenting] = useState(false)
  const [error, setError] = useState("")
  const [liking, setLiking] = useState<number | null>(null)
  const [likingComment, setLikingComment] = useState<number | null>(null)

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
      return
    }

    if (!loading) {
      fetchThread()
    }
  }, [threadId, user, loading, router])

  const fetchThread = async () => {
    try {
      const response = await fetch(`/api/threads/${threadId}`, {
        credentials: "include",
      })
      if (response.ok) {
        const data = await response.json()
        setThread(data)
      } else {
        setError("Thread not found")
      }
    } catch (err) {
      setError("An error occurred while loading thread")
      console.error("Thread fetch error:", err)
    } finally {
      setThreadLoading(false)
    }
  }

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!commentContent.trim()) return

    setCommenting(true)
    setError("")

    try {
      const response = await fetch(`/api/threads/${threadId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ content: commentContent }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.message || "Failed to add comment")
        return
      }

      setCommentContent("")
      fetchThread()
    } catch (err) {
      setError("An error occurred while adding comment")
      console.error("Comment error:", err)
    } finally {
      setCommenting(false)
    }
  }

  const handleDeleteComment = async (commentId: number) => {
    if (!confirm("Are you sure you want to delete this comment?")) return

    try {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: "DELETE",
        credentials: "include",
      })

      if (response.ok) {
        fetchThread()
      } else {
        setError("Failed to delete comment")
      }
    } catch (err) {
      setError("An error occurred while deleting comment")
      console.error("Delete error:", err)
    }
  }

  const handleLikeThread = async () => {
    if (!thread) return
    setLiking(thread.id)

    try {
      const response = await fetch(`/api/threads/${thread.id}/like`, {
        method: "POST",
        credentials: "include",
      })

      if (response.ok) {
        setThread({
          ...thread,
          is_liked: !thread.is_liked,
          likes_count: thread.is_liked ? thread.likes_count - 1 : thread.likes_count + 1,
        })
      }
    } catch (err) {
      console.error("Like error:", err)
    } finally {
      setLiking(null)
    }
  }

  const handleLikeComment = async (commentId: number) => {
    if (!thread) return
    setLikingComment(commentId)

    try {
      const response = await fetch(`/api/comments/${commentId}/like`, {
        method: "POST",
        credentials: "include",
      })

      if (response.ok) {
        setThread({
          ...thread,
          comments: thread.comments.map((c) =>
            c.id === commentId
              ? { ...c, is_liked: !c.is_liked, likes_count: c.is_liked ? c.likes_count - 1 : c.likes_count + 1 }
              : c,
          ),
        })
      }
    } catch (err) {
      console.error("Like error:", err)
    } finally {
      setLikingComment(null)
    }
  }

  if (loading || threadLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading thread...</p>
        </div>
      </div>
    )
  }

  if (!thread) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-2xl mx-auto">
          <Alert variant="destructive">
            <AlertDescription>{error || "Thread not found"}</AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  const isThreadAuthor = user?.id === thread.user.id

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <Link href="/threads">
          <Button variant="outline" className="hover:bg-secondary transition-colors bg-transparent">
            ← Back to Threads
          </Button>
        </Link>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="space-y-4">
              <div>
                <CardTitle className="text-2xl">{thread.title}</CardTitle>
                <CardDescription className="mt-2">{thread.content}</CardDescription>
              </div>
              <div className="flex items-center justify-between">
                <Link href={`/users/${thread.user.id}`}>
                  <div className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={thread.user.profile_photo || "/placeholder.svg"} />
                      <AvatarFallback>{thread.user.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{thread.user.username}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(thread.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </Link>
                <div className="flex gap-2">
                  <button
                    onClick={handleLikeThread}
                    disabled={liking === thread.id}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950 transition-colors group"
                  >
                    <Heart
                      className={`h-5 w-5 transition-all ${
                        thread.is_liked ? "fill-red-500 text-red-500" : "text-muted-foreground group-hover:text-red-500"
                      }`}
                    />
                    <span className="text-sm font-medium">{thread.likes_count}</span>
                  </button>
                  {isThreadAuthor && (
                    <Button
                      variant="destructive"
                      size="sm"
                      className="hover:bg-red-600 transition-colors"
                      onClick={async () => {
                        if (confirm("Delete this thread?")) {
                          await fetch(`/api/threads/${thread.id}`, {
                            method: "DELETE",
                            credentials: "include",
                          })
                          router.push("/threads")
                        }
                      }}
                    >
                      Delete
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Comments ({thread.comments.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleAddComment} className="space-y-2">
              <div className="flex gap-2">
                <Input
                  placeholder="Add a comment..."
                  value={commentContent}
                  onChange={(e) => setCommentContent(e.target.value)}
                  disabled={commenting}
                  maxLength={1000}
                  className="hover:border-primary/50 transition-colors focus:border-primary"
                />
                <Button
                  type="submit"
                  disabled={commenting || !commentContent.trim()}
                  className="hover:shadow-lg transition-shadow"
                >
                  {commenting ? "..." : "Post"}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">{commentContent.length}/1000</p>
            </form>

            <div className="space-y-4 mt-6">
              {thread.comments.length > 0 ? (
                thread.comments.map((comment) => (
                  <div
                    key={comment.id}
                    className="border-l-2 border-border pl-4 py-2 hover:border-primary/50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <Link href={`/users/${comment.user.id}`}>
                        <div className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={comment.user.profile_photo || "/placeholder.svg"} />
                            <AvatarFallback>{comment.user.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">{comment.user.username}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(comment.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </Link>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleLikeComment(comment.id)}
                          disabled={likingComment === comment.id}
                          className="flex items-center gap-1 px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-red-950 transition-colors group"
                        >
                          <Heart
                            className={`h-4 w-4 transition-all ${
                              comment.is_liked
                                ? "fill-red-500 text-red-500"
                                : "text-muted-foreground group-hover:text-red-500"
                            }`}
                          />
                          <span className="text-xs font-medium">{comment.likes_count}</span>
                        </button>
                        {user?.id === comment.user.id && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteComment(comment.id)}
                            className="hover:bg-red-50 dark:hover:bg-red-950 hover:text-red-600 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                    <p className="text-sm mt-2">{comment.content}</p>
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground">No comments yet. Be the first!</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
