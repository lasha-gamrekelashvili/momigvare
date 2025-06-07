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
import { Card, CardContent } from "@/components/ui/card"

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

export function CreatePost() {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: "problem",
      title: "",
      description: "",
      budget: "",
      location: "",
      contactInfo: "",
      tags: "",
    },
  })

  async function onSubmit(data: FormValues) {
    setIsSubmitting(true)
    try {
      const token = localStorage.getItem("token")
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      }
      if (token) {
        headers["Authorization"] = `Bearer ${token}`
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/posts`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          ...data,
          budget: data.budget ? Number(data.budget) : undefined,
          tags: data.tags.split(",").map((tag) => tag.trim()),
        }),
      })

      if (!response.ok) {
        throw new Error("რაღაც ვერ გამოვიდა, გთხოვთ სცადოთ თავიდან.")
      }

      toast.success("პოსტი გამოქვეყნებულია!")
      form.reset()
      // Dispatch event to notify that a new post was created
      window.dispatchEvent(new Event('post-created'))
    } catch (error) {
      toast.error("რაღაც ვერ გამოვიდა, გთხოვთ სცადოთ თავიდან.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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

            <Button type="submit" className="w-full cursor-pointer" disabled={isSubmitting}>
              {isSubmitting ? "იქმნება..." : form.watch("type") === "problem" ? "მომიგვარე" : "მოვაგვარებ"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
} 