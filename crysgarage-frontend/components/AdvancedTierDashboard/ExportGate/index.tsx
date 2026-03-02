import React, { useState, useEffect } from 'react';
import { Download, ArrowLeft, Settings } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthenticationContext';
// CRITICAL: Removed creditService import - backend handles all credit operations

interface ExportGateProps {
  originalFile: File | null;
  processedAudioUrl: string | null;
  audioEffects: any;
  onBack: () => void;
  onUpdateEffectSettings?: (effectType: string, settings: any) => void;
  meterData?: any;
  selectedGenre?: string;
  getProcessedAudioUrl?: never;
}

const ExportGate: React.FC<ExportGateProps> = ({ 
  originalFile, 
  processedAudioUrl, 
  audioEffects, 
  onBack,
  onUpdateEffectSettings,
  meterData,
  selectedGenre,
  getProcessedAudioUrl
}) => {
  const { user, refreshUser } = useAuth();
  const [downloadFormat, setDownloadFormat] = useState<'WAV' | 'MP3' | 'FLAC' | 'AIFF' | 'AAC' | 'OGG'>('WAV');
  const [sampleRate, setSampleRate] = useState<'44.1kHz' | '48kHz' | '88.2kHz' | '96kHz' | '192kHz'>('44.1kHz');
  const [isDownloading, setIsDownloading] = useState(false);
  // Removed client recording/progress modal; server handles conversion
  const [startTime, setStartTime] = useState<number | null>(null);

  // Credits flow removed for Advanced download


  // Pricing removed from Advanced download UI

  // Progress tracking function
  const updateProgress = (_progress: number, _stage: string) => {};

  // Enhanced progress tracking for real-time processing
  const updateRealTimeProgress = (_p: number, _s: string) => {};


  // Download handler that captures the actual processed audio
  const handleDownload = async () => {
    if (!originalFile) {
      console.error('No original file available for processing');
      return;
    }

    // Jasper: Check and consume credit before download
    if (!user?.id) {
      alert('Please sign in to download');
      return;
    }

    // CRITICAL: Backend is authoritative for credit checks
    // Frontend does NOT check credits - backend validates and deducts atomically
    // This ensures credits are only deducted on successful backend-approved download
    
    // CRITICAL: Prevent double-click downloads
    if (isDownloading) {
      console.warn('⚠️ ExportGate: Download already in progress, ignoring duplicate click');
      return;
    }

    setIsDownloading(true);
    setStartTime(Date.now());
    
    try {
      console.log('🎵 Advanced download starting — backend FFmpeg proxy');
      
      // CRITICAL: Start download first, then consume credit
      // This ensures credit is only deducted when download actually begins
      
      // Prefer server-processed URL (from /master-advanced) and let FFmpeg proxy convert it
      let audioToDownload: File | Blob = originalFile;
      let audioUrl = URL.createObjectURL(originalFile);
      
      // CRITICAL: Backend checks and decrements credits atomically
      // Frontend only passes user_id - backend handles all credit logic
      if (!user?.id) {
        console.error('❌ ExportGate: No user ID for download', { user });
        alert('Please sign in to download');
        return;
      }
      
      if (processedAudioUrl) {
        // CRITICAL: Always use HTTPS in production to avoid mixed content warnings
        const base = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
          ? 'http://localhost:8002'
          : 'https://crysgarage.studio';
        const srNum = Math.round(parseFloat(sampleRate.replace('kHz', '')) * 1000);
        
        // CRITICAL: Extract file_id from processedAudioUrl for idempotency
        // Pattern: /files/{tier}/mastered_{uuid}.wav
        const match = processedAudioUrl.match(/mastered_([a-f0-9\-]+)\.wav$/i);
        const fileId = match ? match[1] : null;
        
        if (!fileId) {
          console.error('❌ ExportGate: Could not extract file_id from URL:', processedAudioUrl);
          throw new Error('Invalid file URL - file_id not found');
        }
        
        // CRITICAL: Step 1 - Request download approval (checks credits, does NOT deduct)
        const requestFormData = new FormData();
        requestFormData.append('file_id', fileId);
        requestFormData.append('format', downloadFormat);
        requestFormData.append('sample_rate', srNum.toString());
        requestFormData.append('tier', 'advanced');
        requestFormData.append('bit_depth', '24');
        requestFormData.append('user_id', user.id);
        
        console.log('📥 ExportGate: Requesting download approval (credit check only):', {
          file_id: fileId,
          format: downloadFormat,
          sample_rate: srNum,
          user_id: user.id
        });
        
        // CRITICAL: Request download approval - backend checks credits but does NOT deduct
        const requestResponse = await fetch(`${base}/downloads/request`, {
          method: 'POST',
          body: requestFormData,
        });
        
        if (!requestResponse.ok) {
          let errorMessage = 'Download request failed';
          try {
            const errorText = await requestResponse.text();
            try {
              const errorData = JSON.parse(errorText);
              errorMessage = errorData.detail || errorData.message || errorMessage;
            } catch {
              errorMessage = errorText || `Server error: ${requestResponse.status} ${requestResponse.statusText}`;
            }
          } catch (parseError) {
            errorMessage = `Server error: ${requestResponse.status} ${requestResponse.statusText}`;
          }
          
          console.error('❌ Backend download request error:', {
            status: requestResponse.status,
            statusText: requestResponse.statusText,
            error: errorMessage
          });
          
          throw new Error(errorMessage);
        }
        
        const requestData = await requestResponse.json();
        const downloadUrl = requestData.download_url;
        
        if (!downloadUrl) {
          throw new Error('Backend did not return download URL');
        }
        
        console.log('✅ Download approved (credits checked, not deducted yet):', downloadUrl);
        
        // CRITICAL: Step 2 - Download file using fetch to verify success
        console.log('📥 Downloading file to verify success...');
        const downloadResponse = await fetch(downloadUrl);
        
        if (!downloadResponse.ok) {
          const errorText = await downloadResponse.text();
          throw new Error(`Download failed: ${downloadResponse.status} ${downloadResponse.statusText}. ${errorText.slice(0, 200)}`);
        }
        
        // CRITICAL: Verify Content-Type is audio (not HTML/JSON error)
        const contentType = downloadResponse.headers.get('content-type');
        if (contentType && !contentType.startsWith('audio/') && contentType !== 'application/octet-stream') {
          const errorText = await downloadResponse.text();
          throw new Error(`Invalid content type: ${contentType}. Expected audio file. Response: ${errorText.slice(0, 200)}`);
        }
        
        // CRITICAL: Get file size from Content-Length header
        const contentLength = downloadResponse.headers.get('content-length');
        const fileSize = contentLength ? parseInt(contentLength, 10) : 0;
        
        if (fileSize <= 0) {
          throw new Error('Downloaded file size is invalid or zero. Download may have failed.');
        }
        
        // CRITICAL: Verify file size is reasonable (at least 1KB for audio)
        if (fileSize < 1000) {
          throw new Error(`Downloaded file is too small (${fileSize} bytes). Expected audio file.`);
        }
        
        console.log(`✅ Download verified: file_size=${fileSize} bytes, content_type=${contentType}`);
        
        // CRITICAL: Step 3 - Convert blob to download link
        const blob = await downloadResponse.blob();
        const blobUrl = URL.createObjectURL(blob);
        
        const filename = `mastered_${fileId}_${downloadFormat.toLowerCase()}_${srNum}.${downloadFormat.toLowerCase() === 'mp3' ? 'mp3' : 'wav'}`;
        
        // Trigger browser download
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = filename;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up blob URL after a delay
        setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
        
        console.log(`✅ File downloaded successfully: ${filename} (${fileSize} bytes)`);
        
        // CRITICAL: Step 4 - Complete download and deduct credits (ONLY after verified success)
        console.log('💰 Completing download and deducting credits...');
        const completeFormData = new FormData();
        completeFormData.append('file_id', fileId);
        completeFormData.append('tier', 'advanced');
        completeFormData.append('user_id', user.id);
        completeFormData.append('file_size', fileSize.toString());
        completeFormData.append('format', downloadFormat);
        completeFormData.append('sample_rate', srNum.toString());
        
        const completeResponse = await fetch(`${base}/downloads/complete`, {
          method: 'POST',
          body: completeFormData,
        });
        
        if (!completeResponse.ok) {
          const errorText = await completeResponse.text();
          let errorMessage = 'Failed to complete download';
          try {
            const errorData = JSON.parse(errorText);
            errorMessage = errorData.detail || errorData.message || errorMessage;
          } catch {
            errorMessage = errorText || `Server error: ${completeResponse.status}`;
          }
          
          console.error('❌ Download completion failed:', errorMessage);
          // File was downloaded but credit deduction failed - user keeps file but credits not deducted
          throw new Error(`Warning: File downloaded but credit deduction failed: ${errorMessage}. Please contact support.`);
        } else {
          const completeData = await completeResponse.json();
          console.log('✅ Download completed and credits deducted:', completeData);
        }
        
      } else {
        throw new Error('No processed audio URL available. Please process the audio first.');
      }
      
      // CRITICAL: Refresh user state after successful download completion
      await refreshUser();
      console.log('✅ ExportGate: User refreshed after successful download completion');
      
      console.log(`✅ Downloaded: ${downloadFormat} @ ${sampleRate}`);
      
      // Success - no alert needed, user can see the download in their browser
      
    } catch (error) {
      console.error('❌ Error downloading file:', error);
      
      // Provide more specific error messages
      alert(`Download failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsDownloading(false);
    }
  };

  // Removed visualizer/modal

  return (
    <>
    <div className="max-w-4xl mx-auto space-y-4">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="p-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-white" />
          </button>
          <div className="flex items-center space-x-2">
            <div className="bg-gradient-to-r from-crys-gold to-yellow-500 p-1.5 rounded-lg">
              <Download className="w-4 h-4 text-gray-900" />
            </div>
            <h2 className="text-xl font-bold text-white">Export Gate</h2>
          </div>
        </div>
      </div>

      {/* File Information */}
      {originalFile && (
       <div className="bg-gradient-to-br from-gray-800 to-gray-700 rounded-lg p-4 border border-gray-600">
          <h3 className="text-md font-semibold text-white mb-4 flex items-center">
            <Download className="w-4 h-4 mr-2" />
            File Information
           </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-300">File Name:</span>
                <span className="text-white font-medium">{originalFile.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-300">File Size:</span>
                <span className="text-white font-medium">
                  {(originalFile.size / (1024 * 1024)).toFixed(2)} MB
                </span>
            </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-300">File Type:</span>
                <span className="text-white font-medium">{originalFile.type || 'Audio'}</span>
          </div>
        </div>
        
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-300">Genre Preset:</span>
                <span className="text-crys-gold font-medium">{selectedGenre || 'None'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-300">Processing:</span>
                <span className="text-green-400 font-medium">Complete</span>
          </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-300">Effects Applied:</span>
                <span className="text-purple-400 font-medium">
                  {Object.values(audioEffects).filter((effect: any) => effect.enabled).length} Effects
                </span>
          </div>
          </div>
        </div>
      </div>
      )}

      {/* Export Settings */}
      <div className="bg-gradient-to-br from-gray-800 to-gray-700 rounded-lg p-4 border border-gray-600">
        <h3 className="text-md font-semibold text-white mb-4 flex items-center">
          <Settings className="w-4 h-4 mr-2" />
          Export Settings
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Sample Rate Selection */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-2">Sample Rate</h4>
            <div className="space-y-2">
              <label className="flex items-center justify-between p-2 bg-gray-900 rounded border border-gray-600 cursor-pointer hover:bg-gray-800 transition-colors">
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="sampleRate"
                    value="44.1kHz"
                    checked={sampleRate === '44.1kHz'}
                    onChange={(e) => setSampleRate(e.target.value as any)}
                    className="text-crys-gold"
                  />
                  <div>
                    <div className="text-white text-sm">44.1 kHz</div>
                    <div className="text-xs text-gray-400">CD standard</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-white text-sm">$0.00</div>
                </div>
              </label>

              <label className="flex items-center justify-between p-2 bg-gray-900 rounded border border-gray-600 cursor-pointer hover:bg-gray-800 transition-colors">
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="sampleRate"
                    value="48kHz"
                    checked={sampleRate === '48kHz'}
                    onChange={(e) => setSampleRate(e.target.value as any)}
                    className="text-crys-gold"
                  />
                  <div>
                    <div className="text-white text-sm">48 kHz</div>
                    <div className="text-xs text-gray-400">Professional</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-white text-sm">$0.00</div>
                </div>
              </label>

              <label className="flex items-center justify-between p-2 bg-gray-900 rounded border border-gray-600 cursor-pointer hover:bg-gray-800 transition-colors">
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="sampleRate"
                    value="88.2kHz"
                    checked={sampleRate === '88.2kHz'}
                    onChange={(e) => setSampleRate(e.target.value as any)}
                    className="text-crys-gold"
                  />
                  <div>
                    <div className="text-white text-sm">88.2 kHz</div>
                    <div className="text-xs text-gray-400">High-res</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-white text-sm">$0.00</div>
                </div>
              </label>

              <label className="flex items-center justify-between p-2 bg-gray-900 rounded border border-gray-600 cursor-pointer hover:bg-gray-800 transition-colors">
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="sampleRate"
                    value="96kHz"
                    checked={sampleRate === '96kHz'}
                    onChange={(e) => setSampleRate(e.target.value as any)}
                    className="text-crys-gold"
                  />
                  <div>
                    <div className="text-white text-sm">96 kHz</div>
                    <div className="text-xs text-gray-400">High-res</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-white text-sm">$0.00</div>
                </div>
              </label>

              <label className="flex items-center justify-between p-2 bg-gray-900 rounded border border-gray-600 cursor-pointer hover:bg-gray-800 transition-colors">
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="sampleRate"
                    value="192kHz"
                    checked={sampleRate === '192kHz'}
                    onChange={(e) => setSampleRate(e.target.value as any)}
                    className="text-crys-gold"
                  />
                  <div>
                    <div className="text-white text-sm">192 kHz</div>
                    <div className="text-xs text-gray-400">Ultra high-res</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-white text-sm">$0.00</div>
                </div>
              </label>

            </div>
          </div>

          {/* Format Selection */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-2">Download Format</h4>
            <div className="space-y-2">
              <label className="flex items-center justify-between p-2 bg-gray-900 rounded border border-gray-600 cursor-pointer hover:bg-gray-800 transition-colors">
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="format"
                    value="MP3"
                    checked={downloadFormat === 'MP3'}
                    onChange={(e) => setDownloadFormat(e.target.value as any)}
                    className="text-crys-gold"
                  />
                  <div>
                    <div className="text-white text-sm">MP3</div>
                    <div className="text-xs text-gray-400">Compressed</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-white text-sm">$0.00</div>
                </div>
              </label>

              <label className="flex items-center justify-between p-2 bg-gray-900 rounded border border-gray-600 cursor-pointer hover:bg-gray-800 transition-colors">
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="format"
                    value="WAV"
                    checked={downloadFormat === 'WAV'}
                    onChange={(e) => setDownloadFormat(e.target.value as any)}
                    className="text-crys-gold"
                  />
                  <div>
                    <div className="text-white text-sm">WAV (24-bit)</div>
                    <div className="text-xs text-gray-400">Studio quality</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-white text-sm">$0.00</div>
                </div>
              </label>

              <label className="flex items-center justify-between p-2 bg-gray-900 rounded border border-gray-600 cursor-pointer hover:bg-gray-800 transition-colors">
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="format"
                    value="FLAC"
                    checked={downloadFormat === 'FLAC'}
                    onChange={(e) => setDownloadFormat(e.target.value as any)}
                    className="text-crys-gold"
                  />
                  <div>
                    <div className="text-white text-sm">FLAC</div>
                    <div className="text-xs text-gray-400">Lossless</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-white text-sm">$1.00</div>
                </div>
              </label>

              <label className="flex items-center justify-between p-2 bg-gray-900 rounded border border-gray-600 cursor-pointer hover:bg-gray-800 transition-colors">
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="format"
                    value="AIFF"
                    checked={downloadFormat === 'AIFF'}
                    onChange={(e) => setDownloadFormat(e.target.value as any)}
                    className="text-crys-gold"
                  />
                  <div>
                    <div className="text-white text-sm">AIFF (24-bit)</div>
                    <div className="text-xs text-gray-400">Apple uncompressed</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-white text-sm">$0.00</div>
                </div>
              </label>

              <label className="flex items-center justify-between p-2 bg-gray-900 rounded border border-gray-600 cursor-pointer hover:bg-gray-800 transition-colors">
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="format"
                    value="AAC"
                    checked={downloadFormat === 'AAC'}
                    onChange={(e) => setDownloadFormat(e.target.value as any)}
                    className="text-crys-gold"
                  />
                  <div>
                    <div className="text-white text-sm">AAC (256kbps)</div>
                    <div className="text-xs text-gray-400">High quality AAC</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-white text-sm">$0.00</div>
                </div>
              </label>

              <label className="flex items-center justify-between p-2 bg-gray-900 rounded border border-gray-600 cursor-pointer hover:bg-gray-800 transition-colors">
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="format"
                    value="OGG"
                    checked={downloadFormat === 'OGG'}
                    onChange={(e) => setDownloadFormat(e.target.value as any)}
                    className="text-crys-gold"
                  />
                  <div>
                    <div className="text-white text-sm">OGG (q8)</div>
                    <div className="text-xs text-gray-400">Vorbis</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-white text-sm">$0.00</div>
                </div>
              </label>

              {/* WAV 32-bit removed for Advanced: WAV is fixed to 24-bit in backend */}

            </div>
          </div>
        </div>

        {/* Pitch correction removed for Advanced export */}
      </div>

      {/* Credit Display removed for Advanced */}

      {/* Download Button */}
      <div className="text-center">
        <button
          onClick={handleDownload}
          disabled={!originalFile || isDownloading}
          className={`bg-crys-gold text-black px-6 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2 mx-auto ${
            originalFile && !isDownloading
              ? 'hover:bg-yellow-400'
              : 'opacity-50 cursor-not-allowed'
          }`}
        >
          {isDownloading ? (
            <>
              <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
              <span>Processing & Downloading...</span>
            </>
          ) : (
            <>
              <Download className="w-5 h-5" />
              <span>Download Mastered Audio</span>
            </>
          )}
        </button>
        
        {/* Processing warning removed */}
        {originalFile && (
          <div className="mt-2 text-xs text-gray-400">
            Format: {downloadFormat === 'MP3' ? 'MP3 320kbps' : downloadFormat === 'FLAC' ? 'FLAC' : 'WAV 24-bit'} • Sample Rate: {sampleRate}
          </div>
        )}
      </div>
    </div>
    </>
  );
};

export default ExportGate;
