import { useEffect, useState } from "react"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { MapPin, Phone, X, Pencil } from "lucide-react"
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { EditPost } from "./EditPost"

interface User {
  _id: string
  username: string
  role?: string
}

interface Post {
  _id: string
  type: "problem" | "offer"
  title: string
  description: string
  budget?: number
  location: string
  contactInfo: string
  tags: string[]
  createdAt: string
  updatedAt: string
  createdByUserId: string | null
  status: "open" | "solved"
  __v: number
}

function formatTimeAgo(date: string): string {
  const now = new Date()
  const postDate = new Date(date)
  const diffInSeconds = Math.floor((now.getTime() - postDate.getTime()) / 1000)
  
  if (diffInSeconds < 60) {
    return "ახლახანს"
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) {
    return `${diffInMinutes} წუთის წინ`
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) {
    return `${diffInHours} საათის წინ`
  }
  
  const diffInDays = Math.floor(diffInHours / 24)
  return `${diffInDays} დღის წინ`
}

function PostSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2 mt-2" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3 mt-2" />
        <Skeleton className="h-4 w-1/4 mt-2" />
      </CardContent>
      <CardFooter>
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-6 w-14 rounded-full" />
        </div>
      </CardFooter>
    </Card>
  )
}

export function PostsList() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [users, setUsers] = useState<Record<string, User>>({})
  const [selectedPost, setSelectedPost] = useState<Post | null>(null)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [editingPost, setEditingPost] = useState<Post | null>(null)

  const fetchCurrentUser = async () => {
    const token = localStorage.getItem("token")
    if (!token) return

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/me`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      if (!response.ok) throw new Error("Failed to fetch user data")
      const userData = await response.json()
      setCurrentUser(userData)
    } catch (err) {
      console.error("Failed to fetch user data:", err)
    }
  }

  const fetchPosts = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/posts`)
      if (!response.ok) {
        throw new Error("Failed to fetch posts")
      }
      const data = await response.json()
      setPosts(data)
      
      data.forEach((post: Post) => {
        if (post.createdByUserId && !users[post.createdByUserId]) {
          fetchUser(post.createdByUserId)
        }
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const fetchUser = async (userId: string) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/${userId}`)
      if (!response.ok) throw new Error("Failed to fetch user")
      const userData = await response.json()
      setUsers(prev => ({ ...prev, [userId]: userData }))
    } catch (err) {
      console.error("Failed to fetch user:", err)
    }
  }

  useEffect(() => {
    fetchPosts()
    fetchCurrentUser()

    const handlePostCreated = () => {
      fetchPosts()
    }

    window.addEventListener('post-created', handlePostCreated)

    return () => {
      window.removeEventListener('post-created', handlePostCreated)
    }
  }, [])

  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 items-start">
        {[...Array(6)].map((_, index) => (
          <PostSkeleton key={index} />
        ))}
      </div>
    )
  }

  if (error) {
    return <div>Error: {error}</div>
  }

  const canEditPost = (post: Post) => {
    if (!currentUser) return false
    if (currentUser.role === 'admin') return true
    return post.createdByUserId === currentUser._id
  }

  const handleEditClick = (e: React.MouseEvent, post: Post) => {
    e.stopPropagation()
    setEditingPost(post)
  }

  const handleEditSuccess = () => {
    fetchPosts()
    setEditingPost(null)
  }

  const isOwnPost = (post: Post) => {
    if (!currentUser) return false
    return post.createdByUserId === currentUser._id
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-6 md:grid-cols-2 items-start">
        {posts.map((post) => (
          <Card 
            key={post._id} 
            className={`relative ${post.status !== "open" ? "opacity-60" : ""} cursor-pointer hover:shadow-md transition-shadow ${
              isOwnPost(post) ? "border-primary/50 shadow-sm" : ""
            }`}
            onClick={() => setSelectedPost(post)}
          >
            {post.status !== "open" && (
              <div className="absolute inset-0 flex items-center justify-center z-10">
                <span className="text-4xl font-bold text-primary/80 rotate-[-15deg]">მოგვარდა</span>
              </div>
            )}
            <CardHeader>
              <div className="flex items-center gap-2 flex-wrap">
                <CardTitle className="text-lg font-bold">{post.title}</CardTitle>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  post.type === "problem"
                    ? "bg-blue-100 text-blue-800"
                    : "bg-purple-100 text-purple-800"
                }`}>
                  {post.type === "problem" ? "მომიგვარე" : "მოვაგვარებ"}
                </span>
                {post.budget && (
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {post.budget}₾
                  </span>
                )}
                {canEditPost(post) && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="ml-auto hover:bg-primary/10 cursor-pointer"
                    onClick={(e) => handleEditClick(e, post)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {post.createdByUserId 
                  ? users[post.createdByUserId]?.username || "Loading..."
                  : "ანონიმური მომხმარებელი"} • {formatTimeAgo(post.createdAt)}
                {isOwnPost(post) && (
                  <span className="ml-2 text-primary">(ჩემი განცხადება)</span>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="mt-1 mb-3">
                <p className="text-sm text-muted-foreground line-clamp-3">{post.description}</p>
              </div>
              <div className="border-t border-border/50 pt-3">
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5 break-all">
                    <Phone className="h-3 w-3" />
                    <span className="break-all">{post.contactInfo}</span>
                  </div>
                  <div className="flex items-center gap-1.5 break-all">
                    <MapPin className="h-3 w-3" />
                    <span className="break-all">{post.location}</span>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <div className="flex flex-wrap gap-2 w-full">
                {post.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-primary/10 px-2 py-1 text-xs text-primary"
                  >
                    #{tag}
                  </span>
                ))}
                {post.tags.length > 3 && (
                  <span className="rounded-full bg-primary/10 px-2 py-1 text-xs text-primary">
                    +{post.tags.length - 3}
                  </span>
                )}
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>

      <Sheet open={!!selectedPost} onOpenChange={(open) => !open && setSelectedPost(null)}>
        <SheetContent className="w-full sm:max-w-lg p-0 bg-white/90 backdrop-blur-xl shadow-2xl border-none max-h-screen overflow-y-auto h-auto">
          {selectedPost && (
            <>
              <div className="sticky top-0 z-20 bg-white/90 backdrop-blur-xl px-6 pt-6 pb-2 flex items-start justify-between border-b">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <SheetTitle className="text-xl font-bold leading-tight">{selectedPost.title}</SheetTitle>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold shadow-sm ${
                      selectedPost.type === "problem"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-purple-100 text-purple-800"
                    }`}>
                      {selectedPost.type === "problem" ? "მომიგვარე" : "მოვაგვარებ"}
                    </span>
                    {selectedPost.budget && (
                      <span className="px-2 py-1 rounded-full text-xs font-semibold shadow-sm bg-green-100 text-green-800">
                        {selectedPost.budget}₾
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {selectedPost.createdByUserId 
                      ? users[selectedPost.createdByUserId]?.username || "Loading..."
                      : "ანონიმური მომხმარებელი"} • {formatTimeAgo(selectedPost.createdAt)}
                  </div>
                </div>
                <button
                  className="ml-4 mt-1 rounded-full p-2 bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-700 shadow transition-colors cursor-pointer"
                  onClick={() => setSelectedPost(null)}
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="px-6 pb-6 pt-2 space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                    {selectedPost.description}
                  </p>
                </div>

                <div className="border-t border-border/30" />

                <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Phone className="h-4 w-4 text-primary" />
                    <span className="break-all">{selectedPost.contactInfo}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-primary" />
                    <span>{selectedPost.location}</span>
                  </div>
                </div>

                <div className="border-t border-border/30" />

                <div>
                  <div className="flex flex-wrap gap-2">
                    {selectedPost.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary border border-primary/20 shadow-sm"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {editingPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white shadow-lg p-6 relative w-full max-w-2xl mx-2 animate-fade-in rounded-lg">
            <EditPost
              post={editingPost}
              onClose={() => setEditingPost(null)}
              onSuccess={handleEditSuccess}
            />
          </div>
        </div>
      )}
    </div>
  )
} 