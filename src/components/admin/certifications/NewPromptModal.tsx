'use client';

import React, { useState } from 'react';
import { Dialog } from '@headlessui/react'; // UI dialog component
import { AiOutlineClose } from 'react-icons/ai';

// Component definition with props
const NewPromptModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  
  // State for form fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [template, setTemplate] = useState('');

  const handleSave = () => {
    // save logic here

    console.log({
      name,
      description,
      template,
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black opacity-30" aria-hidden="true" />
      <div className="relative bg-white rounded-lg p-6 w-full max-w-2xl z-10">
        {/* Header with title and close icon */}
        <div className="flex justify-between items-center mb-4">
          <Dialog.Title className="text-lg font-semibold">Create New Prompt</Dialog.Title>
          <button onClick={onClose}><AiOutlineClose className="text-gray-500" /></button>
        </div>

        {/* Input fields */}
        <label className="block text-sm font-medium mb-1">Prompt Name</label>
        <input
          className="w-full border rounded px-3 py-2 mb-3"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <label className="block text-sm font-medium mb-1">Description</label>
        <input
          className="w-full border rounded px-3 py-2 mb-3"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <label className="block text-sm font-medium mb-1">Prompt Template</label>
        <textarea
          rows={6}
          className="w-full border rounded px-3 py-2 mb-4 font-mono text-sm"
          value={template}
          onChange={(e) => setTemplate(e.target.value)}
        />

        {/* Action buttons */}
        <div className="flex justify-between gap-2">
          <button onClick={onClose} className="px-4 py-2 border rounded text-gray-600">Cancel</button>
          <button onClick={handleSave} className="px-4 py-2 border rounded text-blue-600 border-blue-500">
            Save as New
          </button>
        </div>
      </div>
    </Dialog>
  );
};

export default NewPromptModal;
