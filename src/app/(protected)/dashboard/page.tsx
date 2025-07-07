'use client';

import { useSession } from 'next-auth/react';

export default function Dashboard() {
  const { data: session } = useSession();

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-black">Dashboard</h1>
        <p className="text-black">Welcome, {session?.user?.name}</p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-xl font-semibold text-black">User Role</h2>
          <p className="mb-2 text-black">
            <span className="font-medium">Current Role:</span>{' '}
            {session?.user?.role || 'Unknown'}
          </p>
          <div className="mt-4">
            <h3 className="mb-2 font-medium text-black">Permissions:</h3>
            <ul className="list-inside list-disc">
              {session?.user?.permissions?.map((permission) => (
                <li key={permission} className="text-black">
                  {permission}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {session?.user?.role === 'SuperAdmin' && (
          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-xl font-semibold text-black">Admin Management</h2>
            <p className="text-black">
              As a Super Admin, you can manage other admin users.
            </p>
            <button className="mt-4 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 cursor-pointer">
              Manage Admins
            </button>
          </div>
        )}

        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-xl font-semibold text-black">User Management</h2>
          <p className="text-black">
            Manage users and their permissions in the system.
          </p>
          <button className="mt-4 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 cursor-pointer">
            Manage Users
          </button>
        </div>

        {session?.user?.permissions?.includes('view_all_logs') && (
          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-xl font-semibold text-black">System Logs</h2>
            <p className="text-black">
              View detailed system logs and activities.
            </p>
            <button className="mt-4 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 cursor-pointer">
              View Logs
            </button>
          </div>
        )}
      </div>
    </>
  );
}
