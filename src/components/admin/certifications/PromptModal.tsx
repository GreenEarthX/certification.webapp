'use client';
import React, { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react'; // UI modal component

// PromptModal component definition with props
const PromptModal = ({
  isOpen,
  onClose,
  initialName = '',
  initialDescription = '',
  initialTemplate = ''
}: {
  isOpen: boolean;
  onClose: () => void;
  initialName?: string;
  initialDescription?: string;
  initialTemplate?: string;
}) => {

  // State variables for form fields
  const [promptName, setPromptName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription);
  const [template, setTemplate] = useState(initialTemplate);

  // Syncs state with initial props when they change
  useEffect(() => {
    setPromptName(initialName);
    setDescription(initialDescription);
    setTemplate(initialTemplate);
  }, [initialName, initialDescription, initialTemplate]);

  const handleSave = () => {
    // Save logic here
    onClose();
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black opacity-30" aria-hidden="true" />
      <div className="relative bg-white rounded-lg p-6 w-full max-w-2xl z-10">
        <Dialog.Title className="text-lg font-semibold mb-4">Prompt Management</Dialog.Title>

        <label className="block text-sm font-medium mb-1">Prompt Name</label>
        <input className="w-full border rounded px-3 py-2 mb-3" value={promptName} onChange={(e) => setPromptName(e.target.value)} />

        <label className="block text-sm font-medium mb-1">Description</label>
        <input className="w-full border rounded px-3 py-2 mb-3" value={description} onChange={(e) => setDescription(e.target.value)} />

        <label className="block text-sm font-medium mb-1">Prompt Template</label>
        <textarea rows={8} className="w-full border rounded px-3 py-2 mb-4 font-mono text-sm" value={template} onChange={(e) => setTemplate(e.target.value)} />

        <div className="flex justify-between gap-2">
          <button onClick={onClose} className="px-4 py-2 border rounded text-gray-600">Cancel</button>
          <button onClick={handleSave} className="px-4 py-2 border rounded text-blue-600 border-blue-500">Save Prompt</button>
        </div>
      </div>
    </Dialog>
  );
};

export default PromptModal;