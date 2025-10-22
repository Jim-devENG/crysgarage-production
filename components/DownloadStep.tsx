import React from 'react';

interface DownloadStepProps {
  onDownload: () => void;
}

export function DownloadStep({ onDownload }: DownloadStepProps) {
  return (
    <div className="p-4">
      <button onClick={onDownload} className="bg-crys-gold text-black px-4 py-2 rounded">
        Download
      </button>
    </div>
  );
}
