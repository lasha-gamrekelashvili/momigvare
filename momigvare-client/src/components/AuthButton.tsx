import { useState, useEffect, useRef } from "react"
import { createPortal } from "react-dom"
import { Button } from "@/components/ui/button"
import { LogIn, LogOut, User as UserIcon, X, Settings } from "lucide-react"
import { LoginForm } from "./login-form"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"

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
  const modalRef = useRef<HTMLDivElement>(null)

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

  // Close modal on outside click
  useEffect(() => {
    if (!showLoginForm) return
    function handleClick(e: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        setShowLoginForm(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [showLoginForm])

  const modal = showLoginForm ? createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div ref={modalRef} className="bg-white rounded-lg shadow-lg p-6 relative w-full max-w-md mx-2 animate-fade-in">
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 cursor-pointer"
          onClick={() => setShowLoginForm(false)}
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>
        <LoginForm onLoginSuccess={handleLoginSuccess} />
      </div>
    </div>,
    document.body
  ) : null

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="flex items-center gap-2 cursor-pointer">
            {user ? <UserIcon className="h-4 w-4" /> : <Settings className="h-4 w-4" />}
            {user && user.username}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          {!user ? (
            <DropdownMenuItem onClick={() => setShowLoginForm(true)} className="cursor-pointer">
              <LogIn className="h-4 w-4 mr-2" /> ავტორიზაცია
            </DropdownMenuItem>
          ) : (
            <>
              <DropdownMenuItem disabled className="opacity-100 cursor-default">
                <UserIcon className="h-4 w-4 mr-2" />
                {user.username}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} disabled={authLoading} className="text-red-600 cursor-pointer">
                <LogOut className="h-4 w-4 mr-2" />
                {authLoading ? "Loading..." : "გამოსვლა"}
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      {modal}
    </>
  )
} 