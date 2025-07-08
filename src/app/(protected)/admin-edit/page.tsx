'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface User {
  id: string;
  name: string;
  email: string;
  role: {
    id: string;
    name: string;
  };
}

interface Role {
  id: string;
  name: string;
}

export default function AdminEditPage() {
  const { data: session } = useSession();
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        
        // Fetch all users
        const usersResponse = await fetch('/api/users');
        if (!usersResponse.ok) {
          throw new Error('Failed to fetch users');
        }
        const usersData = await usersResponse.json();
        setUsers(usersData);
        
        // Fetch all roles
        const rolesResponse = await fetch('/api/roles');
        if (!rolesResponse.ok) {
          throw new Error('Failed to fetch roles');
        }
        const rolesData = await rolesResponse.json();
        setRoles(rolesData);
        
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, []);

  const handleRoleChange = async (userId: string, newRoleId: string) => {
    try {
      const response = await fetch(`/api/users/${userId}/role`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          roleId: newRoleId,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update user role');
      }
      
      const updatedUser = await response.json();
      
      // Update the users list
      setUsers(users.map(user => 
        user.id === userId ? { ...user, role: { id: newRoleId, name: roles.find(r => r.id === newRoleId)?.name || '' } } : user
      ));
      
      setSuccess(`User role updated successfully`);
      setTimeout(() => setSuccess(null), 3000);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      console.error('Error updating user role:', err);
    }
  };

  // Filter users based on search query
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-black">Admin User Management</h1>
        <p className="text-black">Manage user roles and permissions</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-8">
          <div className="text-xl text-black">Loading data...</div>
        </div>
      ) : (
        <div className="rounded-lg bg-white p-6 shadow">
          {error && (
            <div className="mb-4 rounded bg-red-100 p-3 text-red-700">
              {error}
            </div>
          )}
          
          {success && (
            <div className="mb-4 rounded bg-green-100 p-3 text-green-700">
              {success}
            </div>
          )}
          
          <div className="mb-6">
            <label htmlFor="search" className="mb-2 block text-sm font-medium text-black">
              Search Users
            </label>
            <input
              type="text"
              id="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or email"
              className="w-full rounded-md border border-gray-300 p-2 text-black"
            />
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-black">
                    Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-black">
                    Email
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-black">
                    Current Role
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-black">
                    Change Role
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {currentUsers.map((user) => (
                  <tr key={user.id}>
                    <td className="whitespace-nowrap px-6 py-4 text-black">
                      {user.name}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-black">
                      {user.email}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-black">
                      <span className={`rounded-full px-2 py-1 text-xs ${
                        user.role.name === 'SuperAdmin' 
                          ? 'bg-purple-100 text-purple-800' 
                          : user.role.name === 'Admin' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-green-100 text-green-800'
                      }`}>
                        {user.role.name}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                      {user.role.name !== 'SuperAdmin' && (
                        <select
                          value={user.role.id}
                          onChange={(e) => handleRoleChange(user.id, e.target.value)}
                          className="rounded border border-gray-300 p-1 text-black"
                        >
                          {roles
                            .filter(role => role.name !== 'SuperAdmin') // Only SuperAdmin can create other SuperAdmins
                            .map((role) => (
                              <option key={role.id} value={role.id}>
                                {role.name}
                              </option>
                            ))}
                        </select>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-4 flex justify-center">
              <nav className="flex items-center">
                <button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`mx-1 rounded px-3 py-1 ${
                    currentPage === 1 
                      ? 'cursor-not-allowed bg-gray-200 text-gray-500' 
                      : 'bg-gray-200 text-black hover:bg-gray-300 cursor-pointer'
                  }`}
                >
                  Previous
                </button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
                  <button
                    key={number}
                    onClick={() => paginate(number)}
                    className={`mx-1 rounded px-3 py-1 ${
                      currentPage === number 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-200 text-black hover:bg-gray-300 cursor-pointer'
                    }`}
                  >
                    {number}
                  </button>
                ))}
                
                <button
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`mx-1 rounded px-3 py-1 ${
                    currentPage === totalPages 
                      ? 'cursor-not-allowed bg-gray-200 text-gray-500' 
                      : 'bg-gray-200 text-black hover:bg-gray-300 cursor-pointer'
                  }`}
                >
                  Next
                </button>
              </nav>
            </div>
          )}
        </div>
      )}
    </>
  );
}
