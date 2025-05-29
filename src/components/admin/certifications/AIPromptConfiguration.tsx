'use client';
import React, { useState } from 'react';
import promptsData from '@/data/promptsData.json'; 
import PromptModal from './PromptModal';
import PromptListModal from './PromptListModal';
import { Prompt } from '@/models/prompt';

const AIPromptConfiguration = ({
  currentPromptId,
  setCurrentPromptId,
}: {
  currentPromptId: number;
  setCurrentPromptId: React.Dispatch<React.SetStateAction<number>>;
}) => {

  const [prompts, setPrompts] = useState<Prompt[]>(promptsData);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [isPromptListOpen, setPromptListOpen] = useState(false);

  // Find currently selected prompt
  const currentPrompt = prompts.find((p) => p.id === currentPromptId);

  return (
    <div className="bg-white rounded-lg p-6 shadow-md">
      <h2 className="text-lg font-semibold mb-4">AI Prompt Configuration</h2>

      <div className="space-y-3">
        {/* Dropdown for selecting prompt */}
        <div>
          <label className="block mb-1 text-sm font-medium">Current Prompt</label>
          <select
            className="w-full border rounded p-2"
            value={currentPromptId}
            onChange={(e) => setCurrentPromptId(Number(e.target.value))}
          >
            {prompts.map((prompt) => (
              <option key={prompt.id} value={prompt.id}>{prompt.name}</option>
            ))}
          </select>
        </div>

        {/* Open edit modal for current prompt */}    
        <button onClick={() => setEditModalOpen(true)} className="w-full border border-blue-500 text-blue-500 py-2 rounded">
          Edit Prompt
        </button>

        {/* Open list modal for full prompt management */}    
        <button onClick={() => setPromptListOpen(true)} className="w-full border border-blue-500 text-blue-500 py-2 rounded">
          Prompts Configuration
        </button>
      </div>

      {/* Edit current prompt modal */}
      {currentPrompt && (
        <PromptModal
          isOpen={isEditModalOpen}
          onClose={() => setEditModalOpen(false)}
          initialName={currentPrompt.name}
          initialDescription={currentPrompt.description}
          initialTemplate={currentPrompt.template}
        />
      )}

      {/* Manage/select/edit/delete prompts */}
      <PromptListModal
        isOpen={isPromptListOpen}
        onClose={() => setPromptListOpen(false)}
        prompts={prompts}
        onSelect={(id) => {
          setCurrentPromptId(id);
          setPromptListOpen(false);
        }}
        onEdit={(prompt) => {
          setCurrentPromptId(prompt.id);
          setEditModalOpen(true);
          setPromptListOpen(false);
        }}
        onDelete={(id) => {
          setPrompts((prev) => prev.filter((p) => p.id !== id));
        }}
        onAddNew={() => {
          const newPrompt: Prompt = {
            id: Date.now(), // or better: uuid
            name: 'New Prompt',
            description: '',
            template: '',
          };
          setPrompts((prev) => [...prev, newPrompt]);
          setCurrentPromptId(newPrompt.id);
        }}
      />
    </div>
  );
};

export default AIPromptConfiguration;