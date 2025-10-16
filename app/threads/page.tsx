"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/app/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Heart, MessageCircle } from "lucide-react"
import Link from "next/link"

interface Thread {
  id: number
  title: string
  content: string
  user: {
    id: number
    username: string
    profile_photo?: string
  }
  comments_count: number
  likes_count: number
  is_liked: boolean
  created_at: string
}

export default function ThreadsPage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [threads, setThreads] = useState<Thread[]>([])
  const [threadsLoading, setThreadsLoading] = useState(true)
  const [error, setError] = useState("")
  const [liking, setLiking] = useState<number | null>(null)

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
      return
    }

    if (!loading) {
      fetchThreads()
    }
  }, [user, loading, router])

  const fetchThreads = async () => {
    try {
      const response = await fetch("/api/threads", {
        credentials: "include",
      })
      if (response.ok) {
        const data = await response.json()
        setThreads(data)
      } else {
        setError("Failed to load threads")
      }
    } catch (err) {
      setError("An error occurred while loading threads")
      console.error("Threads fetch error:", err)
    } finally {
      setThreadsLoading(false)
    }
  }

  const handleLikeThread = async (e: React.MouseEvent, threadId: number) => {
    e.preventDefault()
    setLiking(threadId)

    try {
      const response = await fetch(`/api/threads/${threadId}/like`, {
        method: "POST",
        credentials: "include",
      })

      if (response.ok) {
        setThreads(
          threads.map((t) =>
            t.id === threadId
              ? { ...t, is_liked: !t.is_liked, likes_count: t.is_liked ? t.likes_count - 1 : t.likes_count + 1 }
              : t,
          ),
        )
      }
    } catch (err) {
      console.error("Like error:", err)
    } finally {
      setLiking(null)
    }
  }

  if (loading || threadsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading threads...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Threads</h1>
            <p className="text-muted-foreground">Join the conversation</p>
          </div>
          <div className="flex gap-2">
            <Link href="/profile">
              <Button variant="outline" className="hover:bg-secondary transition-colors bg-transparent">
                My Profile
              </Button>
            </Link>
            <Link href="/threads/create">
              <Button className="hover:shadow-lg transition-shadow">Create Thread</Button>
            </Link>
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          {threads.length > 0 ? (
            threads.map((thread) => (
              <Link key={thread.id} href={`/threads/${thread.id}`}>
                <Card className="hover:shadow-lg hover:border-primary/50 transition-all duration-200 cursor-pointer">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-xl hover:text-primary transition-colors">{thread.title}</CardTitle>
                        <CardDescription className="mt-2 line-clamp-2">{thread.content}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
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
                      <div className="flex gap-2" onClick={(e) => e.preventDefault()}>
                        <button
                          onClick={(e) => handleLikeThread(e, thread.id)}
                          disabled={liking === thread.id}
                          className="flex items-center gap-1 px-3 py-1 rounded-full hover:bg-red-50 dark:hover:bg-red-950 transition-colors group"
                        >
                          <Heart
                            className={`h-4 w-4 transition-all ${
                              thread.is_liked
                                ? "fill-red-500 text-red-500"
                                : "text-muted-foreground group-hover:text-red-500"
                            }`}
                          />
                          <span className="text-sm font-medium">{thread.likes_count}</span>
                        </button>
                        <div className="flex items-center gap-1 px-3 py-1 rounded-full hover:bg-blue-50 dark:hover:bg-blue-950 transition-colors">
                          <MessageCircle className="h-4 w-4 text-muted-foreground group-hover:text-blue-500" />
                          <span className="text-sm font-medium">{thread.comments_count}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))
          ) : (
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground">
                <p>No threads yet. Be the first to start a conversation!</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
