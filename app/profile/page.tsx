"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/app/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"

interface UserProfile {
  id: number
  username: string
  email: string
  bio?: string
  profile_photo?: string
  threads?: Array<{ id: number; title: string }>
  comments?: Array<{ id: number; content: string }>
}

export default function ProfilePage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [profileLoading, setProfileLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
      return
    }

    if (user) {
      fetchProfile()
    }
  }, [user, loading, router])

  const fetchProfile = async () => {
    try {
      const response = await fetch(`/api/users/${user?.id}`, {
        credentials: "include",
      })
      if (response.ok) {
        const data = await response.json()
        setProfile(data)
      } else {
        setError("Failed to load profile")
      }
    } catch (err) {
      setError("An error occurred while loading profile")
      console.error("Profile fetch error:", err)
    } finally {
      setProfileLoading(false)
    }
  }

  if (loading || profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-2xl mx-auto">
          <Alert variant="destructive">
            <AlertDescription>{error || "Profile not found"}</AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  const initials = profile.username.substring(0, 2).toUpperCase()

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Profile</h1>
          <Link href="/profile/edit">
            <Button>Edit Profile</Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={profile.profile_photo || "/placeholder.svg"} alt={profile.username} />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-2xl">{profile.username}</CardTitle>
                <CardDescription>{profile.email}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {profile.bio && (
              <div>
                <h3 className="font-semibold mb-2">Bio</h3>
                <p className="text-muted-foreground">{profile.bio}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Tabs defaultValue="threads" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="threads">Threads ({profile.threads?.length || 0})</TabsTrigger>
            <TabsTrigger value="comments">Comments ({profile.comments?.length || 0})</TabsTrigger>
          </TabsList>

          <TabsContent value="threads" className="space-y-4">
            {profile.threads && profile.threads.length > 0 ? (
              profile.threads.map((thread) => (
                <Card key={thread.id}>
                  <CardContent className="pt-6">
                    <Link href={`/threads/${thread.id}`} className="hover:underline">
                      <h3 className="font-semibold text-lg">{thread.title}</h3>
                    </Link>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="pt-6 text-center text-muted-foreground">
                  No threads yet. Start a conversation!
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="comments" className="space-y-4">
            {profile.comments && profile.comments.length > 0 ? (
              profile.comments.map((comment) => (
                <Card key={comment.id}>
                  <CardContent className="pt-6">
                    <p className="text-muted-foreground">{comment.content}</p>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="pt-6 text-center text-muted-foreground">
                  No comments yet. Join the conversation!
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
