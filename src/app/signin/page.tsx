"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import SignInForm from "@/components/auth/sign-in-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function SignInPage() {
  const searchParams = useSearchParams();
  const registered = searchParams.get("registered");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-[350px] space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Welcome to LawnSync</CardTitle>
            <CardDescription>Sign in to your account</CardDescription>
          </CardHeader>
          <CardContent>
            {registered && (
              <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-md text-sm">
                Account created successfully! Please sign in.
              </div>
            )}
            <SignInForm />
          </CardContent>
        </Card>
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{" "}
            <Link href="/register" className="text-primary hover:underline">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}