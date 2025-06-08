import { useState } from "react"
import { PostsList } from "@/components/PostsList"
import { Toaster } from "sonner"
import momigvareIcon from "@/assets/momigvare-icon.png"
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/AppSidebar"
import { AuthButton } from "@/components/AuthButton"
import { PostsFilters } from "@/components/PostsFilters"

function App() {
  const [filters, setFilters] = useState({
    type: "all",
    status: "all",
    title: "",
    tags: "",
    location: "",
    minPrice: "",
    maxPrice: "",
  })

  return (
    <SidebarProvider defaultOpen={true}>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b pl-4 pr-8 justify-between">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
          </div>
          <AuthButton />
        </header>
        <div className="flex flex-row items-center justify-center gap-4 mt-8 mb-8 min-h-[100px]">
          <img src={momigvareIcon} alt="Momigvare Logo" className="h-24 w-auto" />
          <PostsFilters onFilterChange={setFilters} />
        </div>
        <div className="flex flex-1 flex-col p-4">
          <Toaster />
          <PostsList filters={filters} onFilterChange={setFilters} />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

export default App