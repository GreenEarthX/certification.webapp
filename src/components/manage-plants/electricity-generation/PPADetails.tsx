'use client';
import React from 'react';
import FileUpload from './FileUpload';

interface Props {
  data: {
    onSite: boolean;
    onSiteGoO: boolean | null;
    onSiteFile: File | null;
    offSite: boolean;
    offSiteGoO: boolean | null;
    offSiteFile: File | null;
    gridFile: File | null;
  };
  onChange: (updated: Props['data']) => void;
}

const PPADetails: React.FC<Props> = ({ data, onChange }) => {
  const toggle = (key: keyof Props['data']) => {
    onChange({ ...data, [key]: !data[key] });
  };

  return (
    <div className="ml-4 mt-2 flex flex-col gap-4">
      {/* On-site */}
      <label className="flex gap-2">
        <input
          type="checkbox"
          checked={data.onSite}
          onChange={() => toggle('onSite')}
          className="accent-blue-600"
        />
        On-site PPA
      </label>

      {data.onSite && (
        <div className="ml-4">
          <div className="flex items-center gap-6 mb-1">
            <label className="font-medium whitespace-nowrap">Do you have GoO?</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-1">
                <input
                  type="radio"
                  name="onSiteGoO"
                  checked={data.onSiteGoO === true}
                  onChange={() => onChange({ ...data, onSiteGoO: true })}
                  className="accent-blue-600"
                />
                Yes
              </label>
              <label className="flex items-center gap-1">
                <input
                  type="radio"
                  name="onSiteGoO"
                  checked={data.onSiteGoO === false}
                  onChange={() => onChange({ ...data, onSiteGoO: false })}
                  className="accent-blue-600"
                />
                No
              </label>
            </div>
          </div>
          {data.onSiteGoO === true && (
            <FileUpload
              label="Submit"
              onChange={(file) => onChange({ ...data, onSiteFile: file })}
            />
          )}
        </div>
      )}

      {/* Off-site */}
      <label className="flex gap-2">
        <input
          type="checkbox"
          checked={data.offSite}
          onChange={() => toggle('offSite')}
          className="accent-blue-600"
        />
        Off-site PPA
      </label>

      {data.offSite && (
        <div className="ml-4 flex flex-col gap-4">
          <label className="font-medium">Grid injection & withdrawal</label>
          <FileUpload
            label="Submit"
            onChange={(file) => onChange({ ...data, gridFile: file })}
          />

          <div className="flex items-center gap-6 mb-1 mt-2">
            <label className="font-medium whitespace-nowrap">Do you have GoO?</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-1">
                <input
                  type="radio"
                  name="offSiteGoO"
                  checked={data.offSiteGoO === true}
                  onChange={() => onChange({ ...data, offSiteGoO: true })}
                  className="accent-blue-600"
                />
                Yes
              </label>
              <label className="flex items-center gap-1">
                <input
                  type="radio"
                  name="offSiteGoO"
                  checked={data.offSiteGoO === false}
                  onChange={() => onChange({ ...data, offSiteGoO: false })}
                  className="accent-blue-600"
                />
                No
              </label>
            </div>
          </div>

          {data.offSiteGoO === true && (
            <FileUpload
              label="Submit"
              onChange={(file) => onChange({ ...data, offSiteFile: file })}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default PPADetails;
