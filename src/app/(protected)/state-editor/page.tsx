'use client';

import { useSession } from 'next-auth/react';

export default function StateEditorPage() {
  const { data: session } = useSession();

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-black">State Editor</h1>
        <p className="text-black">Configure and manage application states</p>
      </div>

      <div className="rounded-lg bg-white p-6 shadow">
        <h2 className="mb-4 text-xl font-semibold text-black">State Configuration</h2>
        <p className="mb-4 text-black">
          This page allows you to edit and configure the states of your SSO application.
          You can define custom states, transitions, and behaviors.
        </p>
        
        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="rounded border border-gray-200 p-4">
            <h3 className="mb-2 text-lg font-medium text-black">Available States</h3>
            <ul className="list-inside list-disc text-black">
              <li>Authentication</li>
              <li>Authorization</li>
              <li>Token Issuance</li>
              <li>Session Management</li>
            </ul>
            <button className="mt-4 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 cursor-pointer">
              Add New State
            </button>
          </div>
          
          <div className="rounded border border-gray-200 p-4">
            <h3 className="mb-2 text-lg font-medium text-black">State Transitions</h3>
            <p className="text-black">
              Configure how states transition from one to another based on user actions and system events.
            </p>
            <button className="mt-4 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 cursor-pointer">
              Configure Transitions
            </button>
          </div>
        </div>
        
        <div className="mt-6">
          <p className="text-sm text-black">
            <strong>Note:</strong> Changes to state configurations may affect the behavior of your SSO system.
            Make sure to test thoroughly before deploying to production.
          </p>
        </div>
      </div>
    </>
  );
}
