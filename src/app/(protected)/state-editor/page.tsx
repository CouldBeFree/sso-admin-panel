'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface User {
  id: string;
  name: string;
  email: string;
}

interface Client {
  id: string;
  name: string;
  client_id: string;
}

interface ClientUser {
  id: string;
  userId: string;
  clientId: string;
  role: string;
  user: User;
  client: Client;
}

export default function StateEditorPage() {
  const { data: session } = useSession();
  const [clients, setClients] = useState<Client[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [clientUsers, setClientUsers] = useState<ClientUser[]>([]);
  const [selectedClient, setSelectedClient] = useState<string>('');
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<string>('editor');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const availableRoles = ['admin', 'editor', 'viewer', 'developer'];

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        
        // Fetch clients
        const clientsResponse = await fetch('/api/clients');
        if (!clientsResponse.ok) {
          throw new Error('Failed to fetch clients');
        }
        const clientsData = await clientsResponse.json();
        setClients(clientsData);
        
        // Fetch only users with 'user' role
        const usersResponse = await fetch('/api/users?role=user');
        if (!usersResponse.ok) {
          throw new Error('Failed to fetch users');
        }
        const usersData = await usersResponse.json();
        console.log({usersData});
        setUsers(usersData);
        
        // Fetch client users
        const clientUsersResponse = await fetch('/api/client-users');
        if (!clientUsersResponse.ok) {
          throw new Error('Failed to fetch client users');
        }
        const clientUsersData = await clientUsersResponse.json();
        setClientUsers(clientUsersData);
        
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, []);

  const handleAssignUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedClient || !selectedUser || !selectedRole) {
      setError('Please select a client, user, and role');
      return;
    }
    
    try {
      const response = await fetch('/api/client-users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clientId: selectedClient,
          userId: selectedUser,
          role: selectedRole,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to assign user to client');
      }
      
      const newClientUser = await response.json();
      
      // Update the client users list
      setClientUsers([...clientUsers, newClientUser]);
      
      // Reset form
      setSelectedUser('');
      setSelectedRole('editor');
      
      setSuccess('User successfully assigned to client');
      setTimeout(() => setSuccess(null), 3000);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      console.error('Error assigning user:', err);
    }
  };

  const handleRemoveClientUser = async (clientUserId: string) => {
    try {
      const response = await fetch(`/api/client-users/${clientUserId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to remove user from client');
      }
      
      // Update the client users list
      setClientUsers(clientUsers.filter(cu => cu.id !== clientUserId));
      
      setSuccess('User successfully removed from client');
      setTimeout(() => setSuccess(null), 3000);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      console.error('Error removing user:', err);
    }
  };

  const filteredClientUsers = selectedClient 
    ? clientUsers.filter(cu => cu.clientId === selectedClient)
    : clientUsers;

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-black">State Management</h1>
        <p className="text-black">Assign users to clients with specific roles</p>
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
            <label htmlFor="client-select" className="mb-2 block text-sm font-medium text-black">
              Select Client
            </label>
            <select
              id="client-select"
              value={selectedClient}
              onChange={(e) => setSelectedClient(e.target.value)}
              className="w-full rounded-md border border-gray-300 p-2 text-black"
            >
              <option value="">-- Select a client --</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name} ({client.client_id})
                </option>
              ))}
            </select>
          </div>
          
          {selectedClient && (
            <>
              <h2 className="mb-4 text-xl font-semibold text-black">Assign New User</h2>
              
              <form onSubmit={handleAssignUser} className="mb-8">
                <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div>
                    <label htmlFor="user-select" className="mb-2 block text-sm font-medium text-black">
                      User
                    </label>
                    <select
                      id="user-select"
                      value={selectedUser}
                      onChange={(e) => setSelectedUser(e.target.value)}
                      className="w-full rounded-md border border-gray-300 p-2 text-black"
                      required
                    >
                      <option value="">-- Select a user --</option>
                      {users.map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.name} ({user.email})
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="role-select" className="mb-2 block text-sm font-medium text-black">
                      Role
                    </label>
                    <select
                      id="role-select"
                      value={selectedRole}
                      onChange={(e) => setSelectedRole(e.target.value)}
                      className="w-full rounded-md border border-gray-300 p-2 text-black"
                      required
                    >
                      {availableRoles.map((role) => (
                        <option key={role} value={role}>
                          {role.charAt(0).toUpperCase() + role.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="flex items-end">
                    <button
                      type="submit"
                      className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 cursor-pointer"
                    >
                      Assign User
                    </button>
                  </div>
                </div>
              </form>
            </>
          )}
          
          <h2 className="mb-4 text-xl font-semibold text-black">Current Users</h2>
          
          {filteredClientUsers.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-black">
                      User
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-black">
                      Email
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-black">
                      Role
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-black">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {filteredClientUsers.map((clientUser) => (
                    <tr key={clientUser.id}>
                      <td className="whitespace-nowrap px-6 py-4 text-black">
                        {clientUser.user.name}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-black">
                        {clientUser.user.email}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-black">
                        <span className="rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-800">
                          {clientUser.role}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm">
                        <button
                          onClick={() => handleRemoveClientUser(clientUser.id)}
                          className="text-red-600 hover:text-red-900 cursor-pointer"
                          title="Remove user from client"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-black">No users assigned to this client yet.</p>
          )}
        </div>
      )}
    </>
  );
}
