'use client';
import React, { useEffect, useRef, useState } from 'react';

interface Props {
  label: string;
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
}

const SelectWithCheckboxTags: React.FC<Props> = ({ label, options, selected, onChange }) => {
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
    <div className="space-y-3" ref={containerRef}>
      {/* Label */}
      <label className="block font-medium">{label}</label>

      {/* Dropdown select box */}
      <div className="relative w-full max-w-md">
        <div
          className="border border-gray-300 rounded-md px-3 py-2 bg-white cursor-pointer flex justify-between items-center text-sm"
          onClick={() => setOpen((prev) => !prev)}
        >
          <span className={selected.length === 0 ? 'text-gray-400' : ''}>
            {selected.length === 0 ? 'Choose regulation' : `${selected.length} selected`}
          </span>
          <svg
            className={`w-4 h-4 transform transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        {open && (
          <div className="absolute z-10 mt-1 w-full max-h-64 overflow-y-auto bg-white border border-gray-200 rounded-md shadow-md text-sm">
            {options.map((option) => (
              <label
                key={option}
                className="flex items-center px-3 py-2 hover:bg-blue-50 cursor-pointer"
              >
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
      </div>

      {/* Selected tags */}
      {selected.length > 0 && (
        <div className="grid grid-cols-2 gap-2 flex">
          {selected.map((item) => (
            <div
              key={item}
              className="border border-blue-500 rounded-md px-3 py-1 text-sm text-blue-900 flex justify-between items-center"
            >
              <span>{item}</span>
              <button
                onClick={() => removeOption(item)}
                className="text-blue-700 hover:text-red-500 ml-2"
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

export default SelectWithCheckboxTags;
