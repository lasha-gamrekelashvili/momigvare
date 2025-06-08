import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { LogIn, LogOut, User as UserIcon, Settings, X } from "lucide-react"
import { LoginForm } from "./login-form"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { Card, CardContent } from "@/components/ui/card"

interface User {
  _id: string
  username: string
  email: string
  role: string
}

interface AuthButtonProps {
  className?: string
}

export function AuthButton({ }: AuthButtonProps) {
  const [user, setUser] = useState<User | null>(null)
  const [authLoading, setAuthLoading] = useState(false)
  const [showLoginForm, setShowLoginForm] = useState(false)

  const handleLoginSuccess = async (token: string) => {
    setAuthLoading(true)
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/me`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      if (!response.ok) throw new Error("Failed to fetch user data")
      const userData = await response.json()
      setUser(userData)
      setShowLoginForm(false)
    } catch (err) {
      console.error("Failed to fetch user data:", err)
      localStorage.removeItem("token")
      setUser(null)
    } finally {
      setAuthLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    setUser(null)
  }

  // Check for existing token on mount
  useEffect(() => {
    const token = localStorage.getItem("token")
    if (token) {
      handleLoginSuccess(token)
    }
  }, [])

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            size="icon" 
            className="flex items-center gap-1 cursor-pointer p-1 h-8 w-8 min-w-0 min-h-0 text-xs"
          >
            {user ? <UserIcon className="h-3.5 w-3.5" /> : <Settings className="h-3.5 w-3.5" />}
            {/* Only show username if you want, or remove for pure icon */}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" side="left" className="min-w-[8rem] p-1 text-xs">
          {!user ? (
            <DropdownMenuItem onClick={() => setShowLoginForm(true)} className="cursor-pointer px-2 py-1 text-xs">
              <LogIn className="h-3.5 w-3.5 mr-1" /> ავტორიზაცია
            </DropdownMenuItem>
          ) : (
            <>
              <DropdownMenuItem disabled className="opacity-100 cursor-default px-2 py-1 text-xs">
                <UserIcon className="h-3.5 w-3.5 mr-1" />
                {user.username}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} disabled={authLoading} className="text-red-600 cursor-pointer px-2 py-1 text-xs">
                <LogOut className="h-3.5 w-3.5 mr-1" />
                {authLoading ? "Loading..." : "გამოსვლა"}
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <Sheet open={showLoginForm} onOpenChange={setShowLoginForm}>
        <SheetContent className="w-full sm:max-w-sm p-0 bg-white/90 backdrop-blur-xl shadow-2xl border-none max-h-screen overflow-y-auto h-auto">
          <div className="sticky top-0 z-20 bg-white/90 backdrop-blur-xl px-6 pt-6 pb-2 flex items-start justify-between border-b">
            <div className="text-xl font-bold leading-tight">ავტორიზაცია</div>
            <button
              className="ml-4 mt-1 rounded-full p-2 bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-700 shadow transition-colors cursor-pointer"
              onClick={() => setShowLoginForm(false)}
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="px-6 py-6">
            <Card className="w-full max-w-sm mx-auto">
              <CardContent>
                <LoginForm onLoginSuccess={handleLoginSuccess} />
              </CardContent>
            </Card>
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
} 