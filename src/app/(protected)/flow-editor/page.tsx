'use client';

import { useSession } from 'next-auth/react';

export default function FlowEditorPage() {
  const { data: session } = useSession();

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-black">Flow Editor</h1>
        <p className="text-black">Design and manage authentication flows</p>
      </div>

      <div className="rounded-lg bg-white p-6 shadow">
        <h2 className="mb-4 text-xl font-semibold text-black">Authentication Flow Configuration</h2>
        <p className="mb-4 text-black">
          This page allows you to customize the authentication flows for your SSO application.
          You can create, edit, and manage different authentication flows based on your requirements.
        </p>
        
        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="rounded border border-gray-200 p-4">
            <h3 className="mb-2 text-lg font-medium text-black">Available Flows</h3>
            <ul className="list-inside list-disc text-black">
              <li>Standard Login</li>
              <li>Multi-Factor Authentication</li>
              <li>Social Login</li>
              <li>Password Reset</li>
            </ul>
            <button className="mt-4 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 cursor-pointer">
              Create New Flow
            </button>
          </div>
          
          <div className="rounded border border-gray-200 p-4">
            <h3 className="mb-2 text-lg font-medium text-black">Flow Components</h3>
            <p className="text-black">
              Drag and drop components to build custom authentication flows with various steps and validations.
            </p>
            <button className="mt-4 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 cursor-pointer">
              Open Flow Designer
            </button>
          </div>
        </div>
        
        <div className="mt-6">
          <h3 className="mb-2 text-lg font-medium text-black">Flow Visualization</h3>
          <div className="h-64 rounded border border-dashed border-gray-300 bg-gray-50 p-4 flex items-center justify-center">
            <p className="text-gray-500">Flow visualization will appear here</p>
          </div>
        </div>
        
        <div className="mt-6">
          <p className="text-sm text-black">
            <strong>Note:</strong> Changes to authentication flows may affect how users authenticate with your system.
            Make sure to test thoroughly before deploying to production.
          </p>
        </div>
      </div>
    </>
  );
}
