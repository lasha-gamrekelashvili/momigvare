import { Input } from "@/components/ui/input"
import { Search, Filter } from "lucide-react"
import React from "react"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface PostsFiltersProps {
  onFilterChange: (filters: {
    type: string
    status: string
    title: string
    tags: string
    location: string
    minPrice: string
    maxPrice: string
  }) => void
}

export function PostsFilters({ onFilterChange }: PostsFiltersProps) {
  const [localFilters, setLocalFilters] = React.useState({
    type: "all",
    status: "all",
    title: "",
    tags: "",
    location: "",
    minPrice: "",
    maxPrice: "",
  })

  const handleInputChange = (field: string, value: string) => {
    const updated = { ...localFilters, [field]: value }
    setLocalFilters(updated)
    onFilterChange(updated)
  }


  return (
    <div className="flex items-center gap-2">
      {/* Type buttons */}
      <div className="flex gap-2">
        <Button
          variant={localFilters.type === "problem" ? "default" : "outline"}
          className="h-10 px-4"
          onClick={() => handleInputChange("type", localFilters.type === "problem" ? "all" : "problem")}
        >
          მომიგვარე
        </Button>
        <Button
          variant={localFilters.type === "offer" ? "default" : "outline"}
          className="h-10 px-4"
          onClick={() => handleInputChange("type", localFilters.type === "offer" ? "all" : "offer")}
        >
          მოვაგვარებ
        </Button>
      </div>
      {/* Filter popover */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="h-10 px-6 font-medium flex items-center gap-2">
            <Filter className="w-4 h-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[500px] max-w-full">
          <div className="flex flex-col gap-4">
            {/* First row: status, price min, price max */}
            <div className="flex gap-3">
              <div className="flex-1 min-w-0">
                <Select value={localFilters.status} onValueChange={val => handleInputChange("status", val)}>
                  <SelectTrigger className="w-full h-10">
                    <SelectValue placeholder="სტატუსი" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">ყველა</SelectItem>
                    <SelectItem value="active">მიმდინარე</SelectItem>
                    <SelectItem value="solved">მოგვარდა</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="relative flex-1 min-w-0">
                <Input
                  type="number"
                  min={0}
                  placeholder="ფასი (მინ)"
                  className="w-full pl-4"
                  value={localFilters.minPrice}
                  onChange={(e) => handleInputChange("minPrice", e.target.value)}
                />
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">≥</span>
              </div>
              <div className="relative flex-1 min-w-0">
                <Input
                  type="number"
                  min={0}
                  placeholder="ფასი (მაქს)"
                  className="w-full pl-4"
                  value={localFilters.maxPrice}
                  onChange={(e) => handleInputChange("maxPrice", e.target.value)}
                />
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">≤</span>
              </div>
            </div>
            {/* Name (title) */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="გაფილტრე სათაურით"
                className="pl-9 w-full"
                value={localFilters.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
              />
            </div>
            {/* Location */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="გაფილტრე მდებარეობით"
                className="pl-9 w-full"
                value={localFilters.location}
                onChange={(e) => handleInputChange("location", e.target.value)}
              />
            </div>
            {/* Tags */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="ძებნა ტეგებით"
                className="pl-9 w-full"
                value={localFilters.tags}
                onChange={(e) => handleInputChange("tags", e.target.value)}
              />
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
} 