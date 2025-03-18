import { ClientProviders } from '@/components/providers/client-providers';
import './globals.css';

export const metadata = {
  title: 'LawnSync',
  description: 'Smart lawn care management',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ClientProviders>
          {children}
        </ClientProviders>
      </body>
    </html>
  );
}
