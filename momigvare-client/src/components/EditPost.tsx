import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { CheckCircle2 } from "lucide-react"

const formSchema = z.object({
  type: z.enum(["problem", "offer"], {
    required_error: "გთხოვთ აირჩიოთ განცხადების ტიპი",
  }),
  title: z.string().min(5, "სათაური უნდა შეიცავდეს მინიმუმ 5 სიმბოლოს"),
  description: z.string().min(20, "აღწერა უნდა შეიცავდეს მინიმუმ 20 სიმბოლოს"),
  budget: z.string().optional(),
  location: z.string().min(2, "მდებარეობა უნდა შეიცავდეს მინიმუმ 2 სიმბოლოს"),
  contactInfo: z.string().min(5, "საკონტაქტო ინფორმაცია უნდა შეიცავდეს მინიმუმ 5 სიმბოლოს"),
  tags: z.string().min(1, "საჭიროა მინიმუმ ერთი ტეგი"),
})

type FormValues = z.infer<typeof formSchema>

interface EditPostProps {
  post: {
    _id: string
    type: "problem" | "offer"
    title: string
    description: string
    budget?: number
    location: string
    contactInfo: string
    tags: string[]
    status: "open" | "solved"
  }
  onClose: () => void
  onSuccess: () => void
}

export function EditPost({ post, onClose, onSuccess }: EditPostProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isMarkingSolved, setIsMarkingSolved] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: post.type,
      title: post.title,
      description: post.description,
      budget: post.budget?.toString() || "",
      location: post.location,
      contactInfo: post.contactInfo,
      tags: post.tags.join(", "),
    },
  })

  async function onSubmit(data: FormValues) {
    setIsSubmitting(true)
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        throw new Error("გთხოვთ გაიაროთ ავტორიზაცია")
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/posts/${post._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...data,
          budget: data.budget ? Number(data.budget) : undefined,
          tags: data.tags.split(",").map((tag) => tag.trim()),
        }),
      })

      if (!response.ok) {
        throw new Error("")
      }

      toast.success("განაცხადი წარმატებით განახლდა!")
      onSuccess()
      onClose()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "რაღაც ვერ გამოვიდა, გთხოვთ სცადოთ თავიდან.")
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleMarkAsSolved() {
    setIsMarkingSolved(true)
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        throw new Error("You must be logged in to mark a post as solved")
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/posts/${post._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: post.status === "open" ? "solved" : "open",
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update post status")
      }

      toast.success(post.status === "open" ? "მოგვარდა!!!" : "კვლავ მოსაგვარებელია")
      onSuccess()
      onClose()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "რაღაც ვერ გამოვიდა, გთხოვთ სცადოთ თავიდან.")
    } finally {
      setIsMarkingSolved(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 w-full max-w-2xl">
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <div className="flex gap-4">
                <Button
                  type="button"
                  variant={field.value === "problem" ? "default" : "outline"}
                  onClick={() => field.onChange("problem")}
                  className="flex-1 cursor-pointer"
                >
                  მომიგვარე
                </Button>
                <Button
                  type="button"
                  variant={field.value === "offer" ? "default" : "outline"}
                  onClick={() => field.onChange("offer")}
                  className="flex-1 cursor-pointer"
                >
                  მოვაგვარებ
                </Button>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{form.watch("type") === "problem" ? "რა მოგიგვაროთ?" : "რას აგვარებთ?"}</FormLabel>
              <FormControl>
                <Input placeholder={"სათაური"} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{"აღწერა"}</FormLabel>
              <FormControl>
                <Textarea
                  placeholder={form.watch("type") === "problem" ? "კონკრეტულად რისი მოგვარება გჭირდებათ?" : "კონკრეტულად რას აგვარებთ?"}
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="budget"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{"რამდენად?"}</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="100, 200, 300..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{"ლოკაცია"}</FormLabel>
              <FormControl>
                <Input placeholder={"თბილისი, ბათუმი, ქუთაისი, ყველგან..."} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="contactInfo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>როგორ დაგიკავშირდნენ?</FormLabel>
              <FormControl>
                <Input placeholder="ნომერი, იმეილი, სოციალური ქსელი..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="tags"
          render={({ field }) => (
            <FormItem>
              <FormLabel>ტეგები</FormLabel>
              <FormControl>
                <Input
                  placeholder="გადაუდებელი, შეკეთება, სანტექნიკა..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-4">
          <Button type="submit" className="flex-1 cursor-pointer" disabled={isSubmitting}>
            {isSubmitting ? "იქმნება..." : "განახლება"}
          </Button>
          <Button type="button" variant="outline" className="flex-1 cursor-pointer" onClick={onClose}>
            გაუქმება
          </Button>
          <Button
            type="button"
            variant={post.status === "open" ? "default" : "outline"}
            className="flex-1 flex items-center gap-2 cursor-pointer"
            onClick={handleMarkAsSolved}
            disabled={isMarkingSolved}
          >
            <CheckCircle2 className="h-4 w-4" />
            {post.status === "open" ? "მოგვარდა" : "კვლავ მოსაგვარებელია"}
          </Button>
        </div>
      </form>
    </Form>
  )
} 