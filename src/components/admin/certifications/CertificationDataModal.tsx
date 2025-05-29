'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { AiOutlineClose, AiOutlineSearch, AiOutlineReload } from 'react-icons/ai';
import Select from 'react-select';

const CertificationDataModal = ({
  isOpen,
  onClose,
  extractedData,
  onSave
}: {
  isOpen: boolean;
  onClose: () => void;
  extractedData: any;
  onSave: (data: any) => void;
}) => {
  const [data, setData] = useState<any>(extractedData);
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (extractedData) setData(extractedData);
  }, [extractedData]);

  const fieldOptions = Object.keys(data || {}).map(key => ({
    value: key,
    label: key,
  }));

  const filteredJsonString = useMemo(() => {
    if (!data) return '';
    if (!searchTerm.trim()) return JSON.stringify(data, null, 2);

    const lowerSearch = searchTerm.toLowerCase();
    const filteredEntries = Object.entries(data).filter(([key, value]) => {
      if (key.toLowerCase().includes(lowerSearch)) return true;
      const valStr = Array.isArray(value)
        ? value.join(', ').toLowerCase()
        : String(value).toLowerCase();
      return valStr.includes(lowerSearch);
    });

    return JSON.stringify(Object.fromEntries(filteredEntries), null, 2);
  }, [searchTerm, data]);

  const handleFieldSelection = (selectedOptions: any) => {
    setSelectedFields(selectedOptions.map((option: any) => option.value));
  };

  const handleFieldUpdate = (field: string, value: string) => {
    const originalValue = data[field];
    const updatedValue = Array.isArray(originalValue)
      ? value.split(',').map((v) => v.trim())
      : value;

    setData({ ...data, [field]: updatedValue });
  };

  const handleJsonEdit = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    try {
      const newData = JSON.parse(e.target.value);
      setData(newData);
    } catch (error) {
      // do nothing
    }
  };

  const resetSearch = () => {
    setSearchTerm('');
    if (textareaRef.current) textareaRef.current.focus();
  };

  const handleExportJson = () => {
    const blob = new Blob([filteredJsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'certification_data.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black opacity-30" aria-hidden="true" />
      <div className="relative bg-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto z-10">
        <div className="flex justify-between items-center mb-4">
          <Dialog.Title className="text-lg font-semibold">Generated Certification Data</Dialog.Title>
          <button onClick={onClose}>
            <AiOutlineClose className="text-gray-500" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="col-span-1 md:col-span-2 relative">
            <div className="relative mb-2">
              <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none ${isSearchFocused ? 'text-blue-500' : 'text-gray-400'}`}>
                <AiOutlineSearch />
              </div>
              <input
                type="text"
                className={`w-full border rounded pl-10 pr-8 py-2 transition-all duration-300 ${isSearchFocused ? 'border-blue-500' : 'border-gray-300'}`}
                placeholder="Search JSON..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                style={{ width: isSearchFocused ? '100%' : 'calc(100% - 24px)' }}
              />
              {searchTerm && (
                <button
                  onClick={resetSearch}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <AiOutlineReload />
                </button>
              )}
            </div>
            <label className="block mb-2 text-sm font-medium">JSON Output</label>
            <div className="relative">
              <textarea
                ref={textareaRef}
                className="w-full border rounded p-3 text-sm font-mono h-64"
                value={filteredJsonString}
                onChange={handleJsonEdit}
              />
              <div className="absolute bottom-2 right-2 text-xs text-gray-400">
                {filteredJsonString ? filteredJsonString.split('\n').length : 0} lines
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Select Fields to Edit</label>
            <Select
              isMulti
              options={fieldOptions}
              value={fieldOptions.filter(option => selectedFields.includes(option.value))}
              onChange={handleFieldSelection}
              className="mb-3 text-sm"
              classNamePrefix="select"
              placeholder="Select fields..."
              closeMenuOnSelect={false}
            />

            {selectedFields.map((field) => {
              const value = data[field];
              const isArray = Array.isArray(value);
              return (
                <div key={field} className="mb-4">
                  <label className="block text-sm font-medium mb-1">{field}</label>
                  {isArray ? (
                    <textarea
                      rows={3}
                      className="w-full border rounded px-3 py-2 text-sm"
                      value={(value as string[]).join(', ')}
                      onChange={(e) => handleFieldUpdate(field, e.target.value)}
                      placeholder="Enter comma-separated values"
                    />
                  ) : (
                    <input
                      type="text"
                      className="w-full border rounded px-3 py-2 text-sm"
                      value={value as string}
                      onChange={(e) => handleFieldUpdate(field, e.target.value)}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-4 flex justify-between gap-4">
          <button
            onClick={() => onSave(data)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded transition-colors"
          >
            Save to Database
          </button>
          <button
            onClick={handleExportJson}
            className="w-full border border-blue-600 text-blue-600 hover:bg-blue-50 py-2 rounded transition-colors"
          >
            Export JSON
          </button>
        </div>
      </div>
    </Dialog>
  );
};

export default CertificationDataModal;
