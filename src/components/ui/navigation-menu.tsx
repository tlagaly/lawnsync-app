import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function NavigationMenu() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="bg-white shadow">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/dashboard" className={`text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium ${isActive('/dashboard') ? 'bg-gray-100' : ''}`}>
              Dashboard
            </Link>
            <Link href="/dashboard/profile" className={`text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium ${isActive('/dashboard/profile') ? 'bg-gray-100' : ''}`}>
              Profile
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
