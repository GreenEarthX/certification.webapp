'use client';

import React, { useState } from 'react';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import { FaCheck } from 'react-icons/fa';
import CertificationDataModal from './CertificationDataModal'; 
import { extractCertificationData, submitCertificationData } from '@/services/admin/certifications/fetchCertificationsAPI';
import { Prompt } from '@/models/prompt';

const CertificationJSONGeneration = ({
  file,
  prompt
}: {
  file: File;
  prompt: Prompt | undefined;
}) => {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');
  const [showModal, setShowModal] = useState(false);
  const [extractedData, setExtractedData] = useState<any>(null);

  const handleGenerate = async () => {
    if (!file || !prompt) return;

    setStatus('loading');
    try {
      const data = await extractCertificationData(file, prompt);
      setExtractedData(data);
      setStatus('success');
      setShowModal(true);
    } catch (err) {
      console.error('Error extracting data:', err);
      setStatus('idle');
    }
  };

  const handleSaveToDatabase = async (json: any) => {
    try {
      const saved = await submitCertificationData(json);
      console.log('Saved:', saved);
      setShowModal(false);
    } catch (error) {
      console.error('Save failed:', error);
    }
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow-md">
      <h2 className="text-lg font-semibold mb-4">Certification JSON Generation</h2>
      <button
        className="w-full border border-blue-500 text-blue-500 py-2 rounded"
        onClick={handleGenerate}
        disabled={status === 'loading'}
      >
        Generate JSON
      </button>

      {status === 'loading' && (
        <div className="mt-4 flex items-center gap-2 text-blue-500">
          <AiOutlineLoading3Quarters className="animate-spin" />
          <span>AI processing your certification data</span>
        </div>
      )}

      {status === 'success' && (
        <div className="mt-4 flex items-center gap-2 text-green-600">
          <FaCheck />
          <span>Documents Parsed Successfully</span>
        </div>
      )}

      <CertificationDataModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        extractedData={extractedData}
        onSave={handleSaveToDatabase}
      />
    </div>
  );
};

export default CertificationJSONGeneration;
