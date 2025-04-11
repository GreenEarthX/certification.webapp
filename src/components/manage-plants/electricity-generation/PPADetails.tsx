'use client';
import React, { useState } from 'react';
import GoOQuestion from './GoOQuestion';
import FileUpload from './FileUpload';

const PPADetails: React.FC = () => {
  const [selectedPPA, setSelectedPPA] = useState<'on-site' | 'off-site' | null>(null);

  const [onSiteGoO, setOnSiteGoO] = useState<boolean | null>(null);
  const [onSiteFile, setOnSiteFile] = useState<File | null>(null);

  const [gridFile, setGridFile] = useState<File | null>(null);
  const [offSiteGoO, setOffSiteGoO] = useState<boolean | null>(null);
  const [offSiteFile, setOffSiteFile] = useState<File | null>(null);

  return (
    <div className="ml-4 mt-2">
      <div className="flex flex-col gap-4">
        {/* On-site radio */}
        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="ppa_type"
            checked={selectedPPA === 'on-site'}
            onChange={() => setSelectedPPA('on-site')}
            className="accent-blue-600"
          />
          On-site PPA
        </label>

        {selectedPPA === 'on-site' && (
          <div className="ml-4">
            <GoOQuestion
              checked={onSiteGoO}
              onChange={setOnSiteGoO}
              showUpload={true}
              onUpload={setOnSiteFile}
            />
          </div>
        )}

        {/* Off-site radio */}
        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="ppa_type"
            checked={selectedPPA === 'off-site'}
            onChange={() => setSelectedPPA('off-site')}
            className="accent-blue-600"
          />
          Off-site PPA
        </label>

        {selectedPPA === 'off-site' && (
          <div className="ml-4 flex flex-col gap-4">
            <div>
              <label className="flex items-center gap-2">Grid injection & withdrawal</label>
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
