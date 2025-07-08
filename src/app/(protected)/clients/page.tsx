'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

interface Client {
  id: string;
  name: string;
  client_id: string;
  client_secret: string;
  description: string;
  scopes: string[];
  grant_types: string[];
  createdAt: string;
  updatedAt: string;
}

export default function ClientsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [visibleSecrets, setVisibleSecrets] = useState<Record<string, boolean>>({});
  const [visibleClientIds, setVisibleClientIds] = useState<Record<string, boolean>>({});

  useEffect(() => {
    async function fetchClients() {
      try {
        const response = await fetch('/api/clients');
        
        if (!response.ok) {
          throw new Error('Failed to fetch clients');
        }
        
        const data = await response.json();
        setClients(data);
      } catch (err) {
        setError('Error loading clients. Please try again.');
        console.error('Error fetching clients:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchClients();
  }, []);

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${type} copied to clipboard`);
    } catch (err) {
      toast.error('Failed to copy to clipboard');
      console.error('Failed to copy:', err);
    }
  };

  const toggleVisibility = (id: string, type: 'secret' | 'clientId') => {
    if (type === 'secret') {
      setVisibleSecrets(prev => ({
        ...prev,
        [id]: !prev[id]
      }));
    } else {
      setVisibleClientIds(prev => ({
        ...prev,
        [id]: !prev[id]
      }));
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this client?')) {
      try {
        const response = await fetch(`/api/clients/${id}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error('Failed to delete client');
        }

        // Remove the deleted client from the state
        setClients(clients.filter(client => client.id !== id));
      } catch (err) {
        setError('Error deleting client. Please try again.');
        console.error('Error deleting client:', err);
      }
    }
  };

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-black">Client Management</h1>
        <Link
          href="/clients/new"
          className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 cursor-pointer"
        >
          Create New Client
        </Link>
      </div>

      <div className="rounded-lg bg-white p-6 shadow">
        <h2 className="mb-4 text-xl font-semibold text-black">Your Clients</h2>
        
        {error && (
          <div className="mb-4 rounded bg-red-100 p-3 text-red-700">
            {error}
          </div>
        )}
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-black">
                  Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-black">
                  Client ID
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-black">
                  Client Secret
                </th>

                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-black">
                  Scopes
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-black">
                  Grant Types
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-black">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-black">
                    Loading clients...
                  </td>
                </tr>
              ) : clients.length > 0 ? (
                clients.map((client) => (
                  <tr key={client.id} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-6 py-4 text-black">
                      {client.name}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-black flex items-center">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono">
                          {visibleClientIds[client.id] ? client.client_id : '••••••••••••••••'}
                        </span>
                        <button 
                          onClick={() => toggleVisibility(client.id, 'clientId')}
                          className="text-gray-500 hover:text-gray-700 cursor-pointer"
                          title={visibleClientIds[client.id] ? "Hide Client ID" : "Show Client ID"}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={visibleClientIds[client.id] ? "M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" : "M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"} />
                          </svg>
                        </button>
                        <button 
                          onClick={() => copyToClipboard(client.client_id, 'Client ID')}
                          className="text-blue-500 hover:text-blue-700 cursor-pointer"
                          title="Copy Client ID"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                          </svg>
                        </button>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-black">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono">
                          {visibleSecrets[client.id] ? client.client_secret : '••••••••••••••••'}
                        </span>
                        <button 
                          onClick={() => toggleVisibility(client.id, 'secret')}
                          className="text-gray-500 hover:text-gray-700 cursor-pointer"
                          title={visibleSecrets[client.id] ? "Hide Client Secret" : "Show Client Secret"}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={visibleSecrets[client.id] ? "M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" : "M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"} />
                          </svg>
                        </button>
                        <button 
                          onClick={() => copyToClipboard(client.client_secret, 'Client Secret')}
                          className="text-blue-500 hover:text-blue-700 cursor-pointer"
                          title="Copy Client Secret"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                          </svg>
                        </button>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-black">
                      {client.scopes.map((scope) => (
                        <span
                          key={scope}
                          className="mr-1 rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-800"
                        >
                          {scope}
                        </span>
                      ))}
                      {client.scopes.length === 0 && 'No scopes'}
                    </td>
                    <td className="px-6 py-4 text-black">
                      {client.grant_types.map((type) => (
                        <span
                          key={type}
                          className="mr-1 rounded-full bg-green-100 px-2 py-1 text-xs text-green-800"
                        >
                          {type}
                        </span>
                      ))}
                      {client.grant_types.length === 0 && 'No grant types'}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                      <button
                        onClick={() => router.push(`/clients/edit/${client.id}`)}
                        className="mr-3 text-blue-600 hover:text-blue-900 cursor-pointer"
                        title="Edit Client"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(client.id)}
                        className="text-red-600 hover:text-red-900 cursor-pointer"
                        title="Delete Client"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-black">
                    No clients found. Click "Create New Client" to add one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
