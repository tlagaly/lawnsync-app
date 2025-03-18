'use client';

import { ReactNode } from 'react';
import { SessionProvider } from 'next-auth/react';

interface ClientProvidersProps {
  children: ReactNode;
}

export function ClientProviders({ children }: ClientProvidersProps) {
  return (
    <SessionProvider>
      {children}
    </SessionProvider>
  );
}