'use client';
import React, { useState } from 'react';
import { Dialog } from '@headlessui/react'; // Modal component
import { AiOutlineClose } from 'react-icons/ai';
import { Prompt } from '@/models/prompt';
import NewPromptModal from './NewPromptModal';

// Component props
const PromptListModal = ({
  isOpen,
  onClose,
  prompts,
  onSelect,
  onEdit,
  onDelete,
  onAddNew = () => {},
}: {
  isOpen: boolean;
  onClose: () => void;
  prompts: Prompt[];
  onSelect: (id: number) => void;
  onEdit: (prompt: Prompt) => void;
  onDelete: (id: number) => void;
  onAddNew?: () => void;
}) => {
  const [isNewModalOpen, setNewModalOpen] = useState(false);

  return (
    <Dialog open={isOpen} onClose={onClose} className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black opacity-30" aria-hidden="true" />
      <div className="relative bg-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto z-10">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <Dialog.Title className="text-lg font-semibold">Prompt Management</Dialog.Title>
          <button onClick={onClose}><AiOutlineClose className="text-gray-500" /></button>
        </div>

        {/* Button to open new prompt modal */}
        <button
          className="w-full border border-blue-500 text-blue-500 py-2 rounded mb-4"
          onClick={() => {
            setNewModalOpen(true);
            onAddNew();
          }}
        >
          Create New Prompt Template
        </button>

        {/* New prompt creation modal */}  
        <NewPromptModal isOpen={isNewModalOpen} onClose={() => setNewModalOpen(false)} />

        {/* List of prompt cards */}
        <div className="space-y-4">
          {prompts.map((prompt) => (
            <div key={prompt.id} className="border rounded p-4">
              <div className="font-medium">{prompt.name}</div>
              <div className="text-sm text-gray-600 mb-2">{prompt.description}</div>
              <div className="flex gap-2">
                <button className="flex-1 border border-blue-500 text-blue-500 rounded px-3 py-2 text-sm" onClick={() => onEdit(prompt)}>Edit</button>
                <button className="flex-1 border border-green-500 text-green-500 rounded px-3 py-2 text-sm" onClick={() => onSelect(prompt.id)}>Select</button>
                <button className="flex-1 border border-red-500 text-red-500 rounded px-3 py-2 text-sm" onClick={() => onDelete(prompt.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Dialog>
  );
};

export default PromptListModal;
