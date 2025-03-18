"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useRouter } from "next/navigation"
import { useState } from "react"

const formSchema = z.object({
  size: z.coerce.number()
    .positive("Lawn size must be greater than 0")
    .max(100000, "Lawn size seems too large"),
  grassType: z.string().min(1, "Please select a grass type"),
  sunExposure: z.string().min(1, "Please select the sun exposure"),
  location: z.string().min(3, "Location must be at least 3 characters"),
})

const grassTypes = [
  "Kentucky Bluegrass",
  "Perennial Ryegrass",
  "Fine Fescue",
  "Tall Fescue",
  "Bermuda",
  "Zoysia",
  "St. Augustine",
  "Centipede",
]

const sunExposures = [
  "Full Sun",
  "Partial Sun",
  "Partial Shade",
  "Full Shade",
]

export function LawnProfileForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      size: 0,
      grassType: "",
      sunExposure: "",
      location: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsLoading(true)
      const response = await fetch("/api/lawn/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      })

      if (!response.ok) {
        throw new Error("Failed to save lawn profile")
      }

      router.refresh()
      router.push("/dashboard")
    } catch (error) {
      console.error("Error saving lawn profile:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="size"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Lawn Size</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter size in square feet"
                  type="number"
                  {...field}
                  onChange={(e) => field.onChange(e.target.valueAsNumber)}
                />
              </FormControl>
              <FormDescription>
                Enter the approximate size of your lawn in square feet
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="grassType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Grass Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your grass type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {grassTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                Choose the type of grass in your lawn
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="sunExposure"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Sun Exposure</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select sun exposure" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {sunExposures.map((exposure) => (
                    <SelectItem key={exposure} value={exposure}>
                      {exposure}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                Select how much sun your lawn typically receives
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter city or ZIP code"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Enter your city or ZIP code for weather-based recommendations
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : "Save Lawn Profile"}
        </Button>
      </form>
    </Form>
  )
}