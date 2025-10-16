"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/app/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function CreateThreadPage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [error, setError] = useState("")
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setCreating(true)

    try {
      const response = await fetch("/api/threads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ title, content }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.message || "Failed to create thread")
        return
      }

      router.push(`/threads/${data.thread.id}`)
    } catch (err) {
      setError("An error occurred while creating thread")
      console.error("Create thread error:", err)
    } finally {
      setCreating(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Create Thread</h1>
          <p className="text-muted-foreground">Start a new conversation</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>New Thread</CardTitle>
            <CardDescription>Share your thoughts with the community</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  type="text"
                  placeholder="What's on your mind?"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  disabled={creating}
                  maxLength={200}
                />
                <p className="text-xs text-muted-foreground">{title.length}/200</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  placeholder="Share your thoughts, ideas, or questions..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required
                  disabled={creating}
                  maxLength={5000}
                  rows={8}
                />
                <p className="text-xs text-muted-foreground">{content.length}/5000</p>
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={creating}>
                  {creating ? "Creating..." : "Create Thread"}
                </Button>
                <Button type="button" variant="outline" onClick={() => router.back()} disabled={creating}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
