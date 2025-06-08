import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"

export function LoginForm({
  className,
  onLoginSuccess,
  ...props
}: React.ComponentProps<"div"> & { onLoginSuccess?: (token: string) => void }) {
  const [isLogin, setIsLogin] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const username = formData.get("username") as string
    const password = formData.get("password") as string
    const email = formData.get("email") as string

    try {
      const endpoint = isLogin ? "/api/users/login" : "/api/users/register"
      const body = isLogin ? { username, password } : { username, password, email }
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong")
      }

      if (isLogin && data.token) {
        // Store the token
        localStorage.setItem("token", data.token)
        onLoginSuccess?.(data.token)
      } else {
        // If registration successful, switch to login
        setIsLogin(true)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col gap-6">
          <div className="grid gap-3">
            <Label htmlFor="username">მომხმარებლის სახელი</Label>
            <Input
              id="username"
              name="username"
              type="text"
              required
            />
          </div>
          {!isLogin && (
            <div className="grid gap-3">
              <Label htmlFor="email">იმეილი</Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
              />
            </div>
          )}
          <div className="grid gap-3">
            <div className="flex items-center">
              <Label htmlFor="password">პაროლი</Label>
              <a
                href="#"
                className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
              >
                დაგავიწყდა პაროლი?
              </a>
            </div>
            <Input id="password" name="password" type="password" required />
          </div>
          {error && (
            <div className="text-sm text-red-500">
              {error}
            </div>
          )}
          <div className="flex flex-col gap-3">
            <Button type="submit" className="w-full cursor-pointer" disabled={loading}>
              {loading ? "Loading..." : isLogin ? "შესვლა" : "რეგისტრაცია"}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              className="w-full cursor-pointer"
              onClick={() => setIsLogin(!isLogin)}
            >
              {isLogin ? "ანგარიშის შექმნა" : "უკვე გაქვთ ანგარიში?"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
