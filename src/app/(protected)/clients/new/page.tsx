'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NewClientPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    client_id: '',
    client_secret: '',
    description: '',
    scopes: [] as string[],
    grant_types: [] as string[],
  });
  const [loading, setLoading] = useState(false);
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
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/clients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create client');
      }

      router.push('/clients');
    } catch (err) {
      console.error('Error creating client:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-black">Create New Client</h1>
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
              <label htmlFor="client_id" className="mb-2 block text-sm font-medium text-black">
                Client ID *
              </label>
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
              <label htmlFor="client_secret" className="mb-2 block text-sm font-medium text-black">
                Client Secret *
              </label>
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
              disabled={loading}
              className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 cursor-pointer disabled:bg-blue-400"
            >
              {loading ? 'Creating...' : 'Create Client'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
