"use client";

import { ReactNode } from "react";
import AuthProvider from "./session-provider";

interface ClientProvidersProps {
  children: ReactNode;
}

export default function ClientProviders({ children }: ClientProvidersProps) {
  return <AuthProvider>{children}</AuthProvider>;
}