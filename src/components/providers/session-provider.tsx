"use client";

import { SessionProvider, signIn, useSession } from "next-auth/react";
import { ReactNode, useEffect } from "react";
import { usePathname } from "next/navigation";

const isProduction = process.env.NODE_ENV === "production";

async function setupTestEnvironment() {
  if (isProduction) return;
  
  try {
    await fetch("/api/setup");
  } catch (error) {
    console.error("Error setting up test environment:", error);
  }
}

function AutoSignIn() {
  const { data: session } = useSession();
  const pathname = usePathname();

  useEffect(() => {
    async function initializeTestUser() {
      if (!isProduction && !session) {
        // Ensure test user exists before attempting sign in
        await setupTestEnvironment();
        
        // Auto sign in with test credentials
        const result = await signIn("credentials", {
          email: "test@example.com",
          password: "password123",
          redirect: false,
        });

        // If sign in was successful and we're on the sign in page,
        // redirect to the originally requested page or dashboard
        if (result?.ok && (pathname === "/signin" || pathname === "/register")) {
          const callbackUrl = new URLSearchParams(window.location.search).get("callbackUrl");
          window.location.href = callbackUrl || "/dashboard";
        }
      }
    }

    initializeTestUser();
  }, [session, pathname]);

  return null;
}

interface AuthProviderProps {
  children: ReactNode;
}

export default function AuthProvider({ children }: AuthProviderProps) {
  return (
    <SessionProvider>
      {!isProduction && <AutoSignIn />}
      {children}
    </SessionProvider>
  );
}