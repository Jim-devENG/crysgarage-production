import React from 'react';

interface FileUploadProps {
  selectedFile: File | null;
  fileInfo: {name: string, size: number, type: string} | null;
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onContinue: () => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ 
  selectedFile, 
  fileInfo, 
  onFileUpload, 
  onContinue 
}) => {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-crys-gold mb-4">Upload Your Audio</h2>
        <p className="text-gray-400">Drag and drop your audio file or click to browse</p>
      </div>
      
      <div className="bg-gradient-to-br from-gray-800 to-gray-700 rounded-xl p-8 border border-gray-600">
        <div className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${
          selectedFile 
            ? 'border-green-500 bg-green-900/20' 
            : 'border-gray-500 hover:border-crys-gold'
        }`}>
          <input
            type="file"
            accept="audio/*"
            onChange={onFileUpload}
            className="hidden"
            id="file-upload"
          />
          <label htmlFor="file-upload" className="cursor-pointer">
            {selectedFile ? (
              <>
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <div className="w-8 h-8 bg-white rounded-full"></div>
                </div>
                <h3 className="text-xl font-semibold mb-2 text-green-400">File Uploaded Successfully!</h3>
                <p className="text-gray-400 mb-4">Click "Enter Studio" to start mastering</p>
                <div className="bg-gray-600 text-gray-400 px-6 py-2 rounded-lg font-semibold inline-block">
                  Change File
                </div>
              </>
            ) : (
              <>
                <div className="w-16 h-16 bg-gray-400 rounded-full mx-auto mb-4"></div>
                <h3 className="text-xl font-semibold mb-2">Choose Audio File</h3>
                <p className="text-gray-400 mb-4">WAV, MP3, FLAC, or other audio formats</p>
                <div className="bg-crys-gold text-black px-6 py-2 rounded-lg font-semibold hover:bg-yellow-400 transition-colors inline-block">
                  Browse Files
                </div>
              </>
            )}
          </label>
        </div>
        
        {/* Always show file info section when file is uploaded */}
        <div className="mt-6 bg-gray-800 rounded-xl p-6">
          {selectedFile && (
            <div className="mb-4 p-3 bg-green-900/30 border border-green-500 rounded-lg">
              <p className="text-green-400 text-sm font-medium">✅ File uploaded successfully!</p>
            </div>
          )}
          
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-crys-gold rounded-full"></div>
              <div>
                <h4 className="font-semibold text-white">{selectedFile?.name || fileInfo?.name}</h4>
                <p className="text-sm text-gray-400">
                  {selectedFile 
                    ? (selectedFile.size / 1024 / 1024).toFixed(2) 
                    : fileInfo 
                      ? (fileInfo.size / 1024 / 1024).toFixed(2) 
                      : '0'
                  } MB
                </p>
                {!selectedFile && fileInfo && (
                  <p className="text-xs text-yellow-400 mt-1">
                    ⚠️ File needs to be re-uploaded to continue
                  </p>
                )}
              </div>
            </div>
          </div>
          
          {/* Prominent Next Button */}
          <div className="text-center">
            <button
              onClick={() => {
                console.log('Enter Studio button clicked!');
                console.log('selectedFile:', selectedFile);
                console.log('fileInfo:', fileInfo);
                onContinue();
              }}
              disabled={!selectedFile}
              className={`w-full py-4 px-6 rounded-xl font-bold text-lg transition-all transform ${
                selectedFile 
                  ? 'bg-gradient-to-r from-crys-gold to-yellow-500 text-black hover:from-yellow-400 hover:to-crys-gold hover:scale-105 shadow-lg' 
                  : 'bg-gray-600 text-gray-400 cursor-not-allowed'
              } flex items-center justify-center space-x-2`}
            >
              <span className="text-xl">Enter Studio</span>
              <div className="w-6 h-6 bg-black rounded-full"></div>
            </button>
            {selectedFile && (
              <p className="text-sm text-gray-400 mt-3">
                Ready to start mastering your audio
              </p>
            )}
            {!selectedFile && (
              <p className="text-sm text-red-400 mt-3">
                Please upload a file first
              </p>
            )}
            
            {/* Debug info */}
            <div className="mt-4 p-2 bg-gray-900 rounded text-xs text-gray-500">
              Debug: selectedFile = {selectedFile ? selectedFile.name : 'null'}, 
              fileInfo = {fileInfo ? fileInfo.name : 'null'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileUpload;
