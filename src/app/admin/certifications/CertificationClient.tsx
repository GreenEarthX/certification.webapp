'use client';

import React, { useState } from "react";
import UploadCertificationDocuments from "@/components/admin/certifications/UploadCertificationDocuments";
import AIPromptConfiguration from "@/components/admin/certifications/AIPromptConfiguration";
import CertificationJSONGeneration from "@/components/admin/certifications/CertificationJSONGeneration";
import promptsData from '@/data/promptsData.json';

const CertificationClient = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [currentPromptId, setCurrentPromptId] = useState<number>(1);

  const selectedPrompt = promptsData.find(p => p.id === currentPromptId);
  const selectedFile = files[0]; 

  return (
    <div className="p-6 space-y-10">
      <UploadCertificationDocuments files={files} setFiles={setFiles} />
      <AIPromptConfiguration currentPromptId={currentPromptId} setCurrentPromptId={setCurrentPromptId} />
      <CertificationJSONGeneration file={selectedFile} prompt={selectedPrompt} />
    </div>
  );
};

export default CertificationClient;
