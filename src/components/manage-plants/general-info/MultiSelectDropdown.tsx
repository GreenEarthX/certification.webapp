'use client';
import React, { useState, useRef, useEffect } from 'react';

interface Props {
  label: string;
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
}

const QuestionWithMultiSelect: React.FC<Props> = ({ label, options, selected, onChange }) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const toggleOption = (option: string) => {
    const updated = selected.includes(option)
      ? selected.filter((item) => item !== option)
      : [...selected, option];
    onChange(updated);
  };

  const removeOption = (option: string) => {
    onChange(selected.filter((item) => item !== option));
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="mb-4" ref={containerRef}>
      {/* Label and Dropdown in one line */}
      <div className="flex items-center gap-4">
        <label className="block accent-blue-600 mr-4 font-medium whitespace-nowrap">
          {label}
        </label>
        <div
          className="flex-1 border rounded-md px-3 py-1.5 bg-white shadow-sm text-sm cursor-pointer"
          onClick={() => setOpen(!open)}
        >
          {selected.length === 0 ? 'Select' : `${selected.length} selected`}
        </div>
      </div>

      {/* Dropdown options */}
      {open && (
        <div className="mt-1 border rounded-md shadow-md bg-white max-h-52 overflow-y-auto z-50 relative">
          {options.map((option, index) => (
            <label key={index} className="block px-3 py-2 hover:bg-blue-50 cursor-pointer">
              <input
                type="checkbox"
                className="mr-2 accent-blue-600"
                checked={selected.includes(option)}
                onChange={() => toggleOption(option)}
              />
              {option}
            </label>
          ))}
        </div>
      )}

      {/* Selected tags */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {selected.map((item, index) => (
            <div
              key={index}
              className="border border-blue-500 rounded-full px-3 py-1 text-sm text-blue-900 flex items-center gap-2"
            >
              {item}
              <button
                onClick={() => removeOption(item)}
                className="text-blue-700 hover:text-red-500"
              >
                &times;
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default QuestionWithMultiSelect;
