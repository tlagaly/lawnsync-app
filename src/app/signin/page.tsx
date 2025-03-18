"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import SignInForm from "@/components/auth/sign-in-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

function SignInContent() {
  const searchParams = useSearchParams();
  const registered = searchParams.get("registered");

  return (
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
  );
}

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-[350px] space-y-6">
        <Suspense fallback={
          <Card>
            <CardContent className="py-6">
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              </div>
            </CardContent>
          </Card>
        }>
          <SignInContent />
        </Suspense>
      </div>
    </div>
  );
}