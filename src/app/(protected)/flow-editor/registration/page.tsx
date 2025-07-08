'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

// Define flow step interface
interface FlowStep {
  id: string;
  type: string;
  title: string;
  description: string;
  required: boolean;
  order: number;
  config: Record<string, any>;
}

// Registration flow editor page
export default function RegistrationFlowEditorPage() {
  const { data: session } = useSession();
  const [flowSteps, setFlowSteps] = useState<FlowStep[]>([
    {
      id: '1',
      type: 'input',
      title: 'Identity Number',
      description: 'User identity or ID number',
      required: true,
      order: 1,
      config: {
        validation: 'text',
        placeholder: 'Enter your identity number'
      }
    },
    {
      id: '2',
      type: 'input',
      title: 'Date of Birth',
      description: 'User date of birth',
      required: true,
      order: 2,
      config: {
        validation: 'date',
        placeholder: 'YYYY-MM-DD',
        inputType: 'date'
      }
    },
    {
      id: '3',
      type: 'input',
      title: 'Phone Number',
      description: 'User phone number',
      required: true,
      order: 3,
      config: {
        validation: 'phone',
        placeholder: 'Enter your phone number',
        inputType: 'tel'
      }
    },
    {
      id: '4',
      type: 'input',
      title: 'Password',
      description: 'User password',
      required: true,
      order: 4,
      config: {
        validation: 'password',
        placeholder: 'Create a password',
        minLength: 8,
        inputType: 'password'
      }
    }
  ]);
  const [selectedStep, setSelectedStep] = useState<FlowStep | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedStep, setDraggedStep] = useState<FlowStep | null>(null);

  // Available step types
  const availableStepTypes = [
    { type: 'input', name: 'Text Input', icon: '📝' },
    { type: 'checkbox', name: 'Checkbox', icon: '✅' },
    { type: 'select', name: 'Dropdown', icon: '🔽' },
    { type: 'captcha', name: 'CAPTCHA', icon: '🤖' },
    { type: 'terms', name: 'Terms & Conditions', icon: '📜' },
    { type: 'verification', name: 'Email Verification', icon: '✉️' }
  ];

  // Handle step selection
  const handleSelectStep = (step: FlowStep) => {
    setSelectedStep(step);
  };

  // Handle step drag start
  const handleDragStart = (e: React.DragEvent, stepType: string) => {
    setIsDragging(true);
    e.dataTransfer.setData('stepType', stepType);
  };

  // Handle step drag over
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  // Handle step drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const stepType = e.dataTransfer.getData('stepType');
    
    // Create new step
    const newStep: FlowStep = {
      id: `step-${Date.now()}`,
      type: stepType,
      title: `New ${stepType.charAt(0).toUpperCase() + stepType.slice(1)}`,
      description: `Description for new ${stepType}`,
      required: true,
      order: flowSteps.length + 1,
      config: {}
    };
    
    setFlowSteps([...flowSteps, newStep]);
    setSelectedStep(newStep);
    setIsDragging(false);
  };

  // Handle step reordering
  const moveStep = (fromIndex: number, toIndex: number) => {
    const updatedSteps = [...flowSteps];
    const [movedStep] = updatedSteps.splice(fromIndex, 1);
    updatedSteps.splice(toIndex, 0, movedStep);
    
    // Update order property
    const reorderedSteps = updatedSteps.map((step, index) => ({
      ...step,
      order: index + 1
    }));
    
    setFlowSteps(reorderedSteps);
  };

  // Handle step deletion
  const deleteStep = (stepId: string) => {
    const updatedSteps = flowSteps.filter(step => step.id !== stepId);
    setFlowSteps(updatedSteps);
    if (selectedStep && selectedStep.id === stepId) {
      setSelectedStep(null);
    }
  };

  // Handle save flow
  const saveFlow = () => {
    // Here you would save the flow to your backend
    console.log('Saving flow:', flowSteps);
    alert('Registration flow saved successfully!');
  };

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-black">Registration Flow Editor</h1>
          <p className="text-black">Design and customize your registration flow</p>
        </div>
        <div className="flex space-x-2">
          <Link
            href="/flow-editor"
            className="rounded border border-gray-300 bg-white px-4 py-2 text-black hover:bg-gray-50 cursor-pointer"
          >
            Back to Flows
          </Link>
          <button
            onClick={saveFlow}
            className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 cursor-pointer"
          >
            Save Flow
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left sidebar - Available components */}
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-xl font-semibold text-black">Available Components</h2>
          <p className="mb-4 text-sm text-black">Drag and drop components to build your registration flow</p>
          
          <div className="space-y-2">
            {availableStepTypes.map((stepType) => (
              <div
                key={stepType.type}
                className="flex items-center rounded border border-gray-200 p-3 cursor-move hover:bg-gray-50"
                draggable
                onDragStart={(e) => handleDragStart(e, stepType.type)}
              >
                <span className="mr-2 text-xl">{stepType.icon}</span>
                <span className="text-black">{stepType.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Middle - Flow canvas */}
        <div 
          className="rounded-lg bg-white p-6 shadow"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <h2 className="mb-4 text-xl font-semibold text-black">Registration Flow</h2>
          <p className="mb-4 text-sm text-black">
            {flowSteps.length === 0 
              ? "Drag components here to build your flow" 
              : "Click on a step to edit its properties"}
          </p>
          
          <div className={`min-h-[400px] rounded border-2 border-dashed p-4 ${isDragging ? 'border-blue-400 bg-blue-50' : 'border-gray-300'}`}>
            {flowSteps.length === 0 ? (
              <div className="flex h-full items-center justify-center">
                <p className="text-gray-500">Drop components here</p>
              </div>
            ) : (
              <div className="space-y-2">
                {flowSteps.sort((a, b) => a.order - b.order).map((step, index) => (
                  <div
                    key={step.id}
                    className={`flex items-center justify-between rounded border p-3 hover:bg-gray-50 ${selectedStep?.id === step.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
                    onClick={() => handleSelectStep(step)}
                  >
                    <div className="flex items-center">
                      <span className="mr-2 text-gray-500">{step.order}.</span>
                      <div>
                        <h3 className="font-medium text-black">{step.title}</h3>
                        <p className="text-xs text-gray-500">{step.type} {step.required ? '(Required)' : '(Optional)'}</p>
                      </div>
                    </div>
                    <div className="flex space-x-1">
                      {index > 0 && (
                        <button 
                          onClick={(e) => { e.stopPropagation(); moveStep(index, index - 1); }}
                          className="rounded p-1 text-gray-500 hover:bg-gray-200 cursor-pointer"
                          title="Move Up"
                        >
                          ↑
                        </button>
                      )}
                      {index < flowSteps.length - 1 && (
                        <button 
                          onClick={(e) => { e.stopPropagation(); moveStep(index, index + 1); }}
                          className="rounded p-1 text-gray-500 hover:bg-gray-200 cursor-pointer"
                          title="Move Down"
                        >
                          ↓
                        </button>
                      )}
                      <button 
                        onClick={(e) => { e.stopPropagation(); deleteStep(step.id); }}
                        className="rounded p-1 text-red-500 hover:bg-red-100 cursor-pointer"
                        title="Delete"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right sidebar - Properties */}
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-xl font-semibold text-black">Properties</h2>
          
          {selectedStep ? (
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-black">Title</label>
                <input
                  type="text"
                  value={selectedStep.title}
                  onChange={(e) => {
                    const updatedStep = { ...selectedStep, title: e.target.value };
                    setSelectedStep(updatedStep);
                    setFlowSteps(flowSteps.map(s => s.id === updatedStep.id ? updatedStep : s));
                  }}
                  className="w-full rounded-md border border-gray-300 p-2 text-black"
                />
              </div>
              
              <div>
                <label className="mb-1 block text-sm font-medium text-black">Description</label>
                <textarea
                  value={selectedStep.description}
                  onChange={(e) => {
                    const updatedStep = { ...selectedStep, description: e.target.value };
                    setSelectedStep(updatedStep);
                    setFlowSteps(flowSteps.map(s => s.id === updatedStep.id ? updatedStep : s));
                  }}
                  className="w-full rounded-md border border-gray-300 p-2 text-black"
                  rows={3}
                />
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="required"
                  checked={selectedStep.required}
                  onChange={(e) => {
                    const updatedStep = { ...selectedStep, required: e.target.checked };
                    setSelectedStep(updatedStep);
                    setFlowSteps(flowSteps.map(s => s.id === updatedStep.id ? updatedStep : s));
                  }}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600"
                />
                <label htmlFor="required" className="ml-2 text-sm text-black">Required field</label>
              </div>
              
              {/* Additional properties based on step type */}
              {selectedStep.type === 'input' && (
                <div>
                  <label className="mb-1 block text-sm font-medium text-black">Placeholder Text</label>
                  <input
                    type="text"
                    value={selectedStep.config.placeholder || ''}
                    onChange={(e) => {
                      const updatedStep = { 
                        ...selectedStep, 
                        config: { ...selectedStep.config, placeholder: e.target.value } 
                      };
                      setSelectedStep(updatedStep);
                      setFlowSteps(flowSteps.map(s => s.id === updatedStep.id ? updatedStep : s));
                    }}
                    className="w-full rounded-md border border-gray-300 p-2 text-black"
                  />
                </div>
              )}
              
              {/* Validation options */}
              <div>
                <label className="mb-1 block text-sm font-medium text-black">Validation Type</label>
                <select
                  value={selectedStep.config.validation || ''}
                  onChange={(e) => {
                    const updatedStep = { 
                      ...selectedStep, 
                      config: { ...selectedStep.config, validation: e.target.value } 
                    };
                    setSelectedStep(updatedStep);
                    setFlowSteps(flowSteps.map(s => s.id === updatedStep.id ? updatedStep : s));
                  }}
                  className="w-full rounded-md border border-gray-300 p-2 text-black"
                >
                  <option value="">None</option>
                  <option value="email">Email</option>
                  <option value="password">Password</option>
                  <option value="text">Text</option>
                  <option value="number">Number</option>
                  <option value="phone">Phone</option>
                </select>
              </div>
            </div>
          ) : (
            <p className="text-gray-500">Select a step to view and edit its properties</p>
          )}
        </div>
      </div>

      {/* Preview section */}
      <div className="mt-6 rounded-lg bg-white p-6 shadow">
        <h2 className="mb-4 text-xl font-semibold text-black">Flow Preview</h2>
        <div className="rounded border border-gray-200 p-6">
          <h3 className="mb-4 text-lg font-medium text-center text-black">Registration</h3>
          
          <div className="mx-auto max-w-md space-y-4">
            {flowSteps.sort((a, b) => a.order - b.order).map((step) => (
              <div key={step.id} className="space-y-1">
                <label className="block text-sm font-medium text-black">
                  {step.title} {step.required && <span className="text-red-500">*</span>}
                </label>
                
                {step.type === 'input' && (
                  <input
                    type={step.config.validation === 'password' ? 'password' : 'text'}
                    placeholder={step.config.placeholder || ''}
                    className="w-full rounded-md border border-gray-300 p-2 text-black"
                    disabled
                  />
                )}
                
                {step.type === 'checkbox' && (
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300 text-blue-600"
                      disabled
                    />
                    <span className="ml-2 text-sm text-black">{step.description}</span>
                  </div>
                )}
                
                {step.type === 'select' && (
                  <select
                    className="w-full rounded-md border border-gray-300 p-2 text-black"
                    disabled
                  >
                    <option>{step.config.placeholder || 'Select an option'}</option>
                  </select>
                )}
                
                {step.type === 'terms' && (
                  <div className="rounded border border-gray-200 bg-gray-50 p-3 text-sm text-gray-600">
                    Terms and conditions text would appear here
                  </div>
                )}
                
                {step.type === 'captcha' && (
                  <div className="flex h-12 items-center justify-center rounded border border-gray-200 bg-gray-50">
                    <span className="text-sm text-gray-500">CAPTCHA would appear here</span>
                  </div>
                )}
                
                {step.type === 'verification' && (
                  <div className="rounded border border-gray-200 bg-gray-50 p-3 text-sm text-gray-600">
                    Email verification step
                  </div>
                )}
              </div>
            ))}
            
            {flowSteps.length > 0 && (
              <div className="pt-4">
                <button className="w-full rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 cursor-pointer" disabled>
                  Register
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
