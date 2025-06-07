import { PostsList } from "@/components/PostsList"
import { CreatePost } from "@/components/CreatePost"
import { Toaster } from "sonner"
import momigvareIcon from "@/assets/momigvare-icon.png"
import { AuthButton } from "@/components/AuthButton"

function App() {
  return (
    <div className="container mx-auto py-8">
      <Toaster />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="lg:sticky lg:top-8 lg:self-start">
          <div className="flex flex-row justify-center items-center gap-4 mb-6">
            <img src={momigvareIcon} alt="Momigvare Logo" className="h-24 w-auto" />
            <AuthButton />
          </div>
          <div className="flex justify-center">
            <CreatePost />
          </div>
        </div>
        <div>
          <PostsList />
        </div>
      </div>
    </div>
  )
}

export default App