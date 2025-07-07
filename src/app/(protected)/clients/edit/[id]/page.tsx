'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

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

export default function EditClientPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { id } = params;
  
  const [formData, setFormData] = useState({
    name: '',
    client_id: '',
    client_secret: '',
    description: '',
    scopes: [] as string[],
    grant_types: [] as string[],
  });
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const availableScopes = ['open_id', 'email', 'profile_with_doc'];
  const availableGrantTypes = [
    'authorization_code',
    'implicit',
    'client_credentials',
    'password',
    'refresh_token',
    'device_code',
    'urn:ietf:params:oauth:grant-type:uma-ticket'
  ];

  useEffect(() => {
    async function fetchClient() {
      try {
        const response = await fetch(`/api/clients/${id}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch client');
        }
        
        const data = await response.json();
        setClient(data);
        setFormData({
          name: data.name,
          client_id: data.client_id,
          client_secret: data.client_secret,
          description: data.description || '',
          scopes: data.scopes || [],
          grant_types: data.grant_types || [],
        });
      } catch (err) {
        setError('Error loading client. Please try again.');
        console.error('Error fetching client:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchClient();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleScopeChange = (scope: string) => {
    setFormData((prev) => {
      if (prev.scopes.includes(scope)) {
        return {
          ...prev,
          scopes: prev.scopes.filter((s) => s !== scope),
        };
      } else {
        return {
          ...prev,
          scopes: [...prev.scopes, scope],
        };
      }
    });
  };

  const handleGrantTypeChange = (grantType: string) => {
    setFormData((prev) => {
      if (prev.grant_types.includes(grantType)) {
        return {
          ...prev,
          grant_types: prev.grant_types.filter((g) => g !== grantType),
        };
      } else {
        return {
          ...prev,
          grant_types: [...prev.grant_types, grantType],
        };
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/clients/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update client');
      }

      router.push('/clients');
    } catch (err) {
      console.error('Error updating client:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-xl text-black">Loading client data...</div>
      </div>
    );
  }

  if (!client && !loading) {
    return (
      <div className="rounded-lg bg-white p-6 shadow">
        <div className="text-red-600">Client not found or you don't have permission to edit it.</div>
        <Link href="/clients" className="mt-4 inline-block rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
          Back to Clients
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-black">Edit Client</h1>
        <Link
          href="/clients"
          className="rounded bg-gray-500 px-4 py-2 text-white hover:bg-gray-600 cursor-pointer"
        >
          Cancel
        </Link>
      </div>

      <div className="rounded-lg bg-white p-6 shadow">
        {error && (
          <div className="mb-4 rounded bg-red-100 p-3 text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="name" className="mb-2 block text-sm font-medium text-black">
              Client Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 p-2 text-black"
              required
            />
          </div>
          
          <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="client_id" className="mb-2 block text-sm font-medium text-black">Client ID *</label>
              <input
                type="text"
                id="client_id"
                name="client_id"
                value={formData.client_id}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 p-2 text-black"
                required
              />
            </div>
            <div>
              <label htmlFor="client_secret" className="mb-2 block text-sm font-medium text-black">Client Secret *</label>
              <input
                type="text"
                id="client_secret"
                name="client_secret"
                value={formData.client_secret}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 p-2 text-black"
                required
              />
            </div>
          </div>

          <div className="mb-4">
            <label htmlFor="description" className="mb-2 block text-sm font-medium text-black">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 p-2 text-black"
              rows={3}
            />
          </div>

          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium text-black">
              Scopes *
            </label>
            <div className="flex flex-wrap gap-2">
              {availableScopes.map((scope) => (
                <div key={scope} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`scope-${scope}`}
                    checked={formData.scopes.includes(scope)}
                    onChange={() => handleScopeChange(scope)}
                    className="mr-2 h-4 w-4"
                    required={formData.scopes.length === 0}
                  />
                  <label htmlFor={`scope-${scope}`} className="text-sm text-black">
                    {scope}
                  </label>
                </div>
              ))}
            </div>

          </div>

          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium text-black">
              Grant Types *
            </label>
            <div className="flex flex-wrap gap-2">
              {availableGrantTypes.map((grantType) => (
                <div key={grantType} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`grant-type-${grantType}`}
                    checked={formData.grant_types.includes(grantType)}
                    onChange={() => handleGrantTypeChange(grantType)}
                    className="mr-2 h-4 w-4"
                    required={formData.grant_types.length === 0}
                  />
                  <label htmlFor={`grant-type-${grantType}`} className="text-sm text-black">
                    {grantType}
                  </label>
                </div>
              ))}
            </div>

          </div>

          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 cursor-pointer disabled:bg-blue-400"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
