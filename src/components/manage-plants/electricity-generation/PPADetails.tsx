'use client';
import React, { useState } from 'react';
import GoOQuestion from './GoOQuestion';
import FileUpload from './FileUpload';

const PPADetails: React.FC = () => {
  const [selectedPPA, setSelectedPPA] = useState<{ onSite: boolean; offSite: boolean }>({
    onSite: false,
    offSite: false,
  });

  const [onSiteGoO, setOnSiteGoO] = useState<boolean | null>(null);
  const [onSiteFile, setOnSiteFile] = useState<File | null>(null);

  const [gridFile, setGridFile] = useState<File | null>(null);
  const [offSiteGoO, setOffSiteGoO] = useState<boolean | null>(null);
  const [offSiteFile, setOffSiteFile] = useState<File | null>(null);

  const handleCheckboxChange = (key: 'onSite' | 'offSite') => {
    setSelectedPPA((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <div className="ml-4 mt-2">
      <div className="flex flex-col gap-4">
        {/* On-site PPA checkbox */}
        <label className="flex font-medium  items-center gap-2">
          <input
            type="checkbox"
            checked={selectedPPA.onSite}
            onChange={() => handleCheckboxChange('onSite')}
            className="accent-blue-600 font-medium "
          />
          On-site PPA
        </label>

        {selectedPPA.onSite && (
          <div className="ml-4">
            <GoOQuestion
              checked={onSiteGoO}
              onChange={setOnSiteGoO}
              showUpload={true}
              onUpload={setOnSiteFile}
            />
          </div>
        )}

        {/* Off-site PPA checkbox */}
        <label className="flex items-center font-medium  gap-2">
          <input
            type="checkbox"
            checked={selectedPPA.offSite}
            onChange={() => handleCheckboxChange('offSite')}
            className="accent-blue-600 font-medium "
          />
          Off-site PPA
        </label>

        {selectedPPA.offSite && (
          <div className="ml-4 flex flex-col gap-4">
            <div>
              <label className="flex items-center font-medium  gap-2">Grid injection & withdrawal</label>
              <FileUpload label="Submit" onChange={setGridFile} />
            </div>
            <GoOQuestion
              checked={offSiteGoO}
              onChange={setOffSiteGoO}
              showUpload={true}
              onUpload={setOffSiteFile}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default PPADetails;
