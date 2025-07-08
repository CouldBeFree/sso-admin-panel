'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path ? 'bg-blue-700' : '';
  };

  return (
    <nav className="bg-blue-600 p-4 text-white shadow-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between">
        <div className="flex items-center">
          <Link href="/dashboard" className="mr-6 text-xl font-bold text-white">
            SSO Admin Panel
          </Link>
          <div className="hidden space-x-4 md:flex">
            <Link
              href="/dashboard"
              className={`rounded px-3 py-2 text-white hover:bg-blue-700 ${isActive('/dashboard')}`}
            >
              Dashboard
            </Link>
            <Link
              href="/clients"
              className={`rounded px-3 py-2 text-white hover:bg-blue-700 ${isActive('/clients')}`}
            >
              Clients
            </Link>
            <Link
              href="/state-editor"
              className={`rounded px-3 py-2 text-white hover:bg-blue-700 ${isActive('/state-editor')}`}
            >
              State Editor
            </Link>
            <Link
              href="/flow-editor"
              className={`rounded px-3 py-2 text-white hover:bg-blue-700 ${isActive('/flow-editor')}`}
            >
              Flow Editor
            </Link>
            <Link
              href="/admin-edit"
              className={`rounded px-3 py-2 text-white hover:bg-blue-700 ${isActive('/admin-edit')}`}
            >
              Admin Edit
            </Link>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <span className="hidden text-sm md:inline">
            {session?.user?.name} ({session?.user?.role})
          </span>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="rounded bg-red-600 px-3 py-1 text-white hover:bg-red-700 cursor-pointer"
          >
            Sign Out
          </button>
        </div>
      </div>
    </nav>
  );
}
