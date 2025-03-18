"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const formSchema = z.object({
  size: z.coerce.number()
    .positive("Lawn size must be greater than 0")
    .max(100000, "Lawn size seems too large"),
  grassType: z.string().min(1, "Please select a grass type"),
  sunExposure: z.string().min(1, "Please select the sun exposure"),
  location: z.string().min(3, "Location must be at least 3 characters"),
});

const grassTypes = [
  "Kentucky Bluegrass",
  "Perennial Ryegrass",
  "Fine Fescue",
  "Tall Fescue",
  "Bermuda",
  "Zoysia",
  "St. Augustine",
  "Centipede",
] as const;

const sunExposures = [
  "Full Sun",
  "Partial Sun",
  "Partial Shade",
  "Full Shade",
] as const;

export default function LawnProfileForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      size: 0,
      grassType: "",
      sunExposure: "",
      location: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setError(null);
      setIsLoading(true);

      const response = await fetch("/api/lawn-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to save lawn profile");
      }

      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Something went wrong");
      console.error("Error saving lawn profile:", error);
    } finally {
      setIsLoading(false);
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
                  type="number"
                  placeholder="Enter size in square feet"
                  disabled={isLoading}
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
              <Select
                disabled={isLoading}
                onValueChange={field.onChange}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select your grass type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent
                  side="bottom"
                  sideOffset={4}
                  className="bg-white border rounded-md shadow-lg"
                >
                  {grassTypes.map((type) => (
                    <SelectItem
                      key={type}
                      value={type}
                      className="cursor-pointer hover:bg-gray-100 px-2 py-1.5"
                    >
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
              <Select
                disabled={isLoading}
                onValueChange={field.onChange}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select sun exposure" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent
                  side="bottom"
                  sideOffset={4}
                  className="bg-white border rounded-md shadow-lg"
                >
                  {sunExposures.map((exposure) => (
                    <SelectItem
                      key={exposure}
                      value={exposure}
                      className="cursor-pointer hover:bg-gray-100 px-2 py-1.5"
                    >
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
                  disabled={isLoading}
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
        {error && <div className="text-sm text-red-500">{error}</div>}
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Saving..." : "Save Profile"}
        </Button>
      </form>
    </Form>
  );
}