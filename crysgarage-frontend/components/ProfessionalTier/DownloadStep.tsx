import React, { useState, useEffect, useRef } from 'react';
import { Download, ArrowLeft, Settings } from 'lucide-react';
import { useAuth } from '../../contexts/AuthenticationContext';
import { DownloadPaymentModal } from './DownloadPaymentModal';

interface DownloadStepProps {
  onDownload: () => void;
  downloadFormat: 'mp3' | 'wav16' | 'wav24';
  onFormatChange: (format: 'mp3' | 'wav16' | 'wav24') => void;
  isDownloading?: boolean;
  originalFile?: File | null;
  processedAudioUrl?: string | null;
  genre?: string;
}

const DownloadStep: React.FC<DownloadStepProps> = ({
  onDownload,
  downloadFormat,
  onFormatChange,
  isDownloading = false,
  originalFile,
  processedAudioUrl,
  genre
}) => {
  const { user, refreshUser } = useAuth();
  // Use same format options as Advanced tier
  const [downloadFormatAdvanced, setDownloadFormatAdvanced] = useState<'WAV' | 'MP3'>('WAV');
  const [sampleRate, setSampleRate] = useState<'44.1kHz' | '48kHz'>('44.1kHz');
  const [isDownloadingState, setIsDownloadingState] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  
  // Sync Advanced format with Professional format
  useEffect(() => {
    switch (downloadFormat) {
      case 'wav24':
      case 'wav16':
        setDownloadFormatAdvanced('WAV');
        break;
      case 'mp3':
        setDownloadFormatAdvanced('MP3');
        break;
      default:
        setDownloadFormatAdvanced('WAV');
    }
  }, [downloadFormat]);

  // Sync Professional format when Advanced format changes
  const handleFormatChange = (format: 'WAV' | 'MP3') => {
    setDownloadFormatAdvanced(format);
    switch (format) {
      case 'WAV':
        onFormatChange('wav24');
        break;
      case 'MP3':
        onFormatChange('mp3');
        break;
    }
  };

  // Download handler - same as Advanced tier ExportGate
  const handleDownload = async () => {
    if (!originalFile) {
      console.error('No original file available for processing');
      return;
    }

    // CRITICAL: Check if payment is required (Professional tier)
    if (!paymentCompleted) {
      console.log('💰 Payment required for Professional tier download');
      setShowPaymentModal(true);
        return;
      }
      
    // CRITICAL: Professional tier doesn't require user.id (payment already completed)
    // But we still prefer to have it if available for tracking
      if (!user?.id) {
      console.warn('⚠️ Professional tier download: No user.id, but continuing (payment already completed)');
    }

    // CRITICAL: Prevent double-click downloads
    if (isDownloadingState) {
      console.warn('⚠️ Download already in progress, ignoring duplicate click');
        return;
      }
      
    setIsDownloadingState(true);
    setStartTime(Date.now());
    
    try {
      console.log('🎵 Professional download starting — backend FFmpeg proxy');
      
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
          console.error('❌ DownloadStep: Could not extract file_id from URL:', processedAudioUrl);
          throw new Error('Invalid file URL - file_id not found');
        }
        
        // CRITICAL: Step 1 - Request download approval (checks payment, does NOT deduct)
        const requestFormData = new FormData();
        requestFormData.append('file_id', fileId);
        requestFormData.append('format', downloadFormatAdvanced);
        requestFormData.append('sample_rate', srNum.toString());
        requestFormData.append('tier', 'professional');
        requestFormData.append('bit_depth', '24');
        // Professional tier: user_id is optional (payment already completed)
        if (user?.id) {
          requestFormData.append('user_id', user.id);
        }
        
        console.log('📥 DownloadStep: Requesting download approval:', {
          file_id: fileId,
          format: downloadFormatAdvanced,
          sample_rate: srNum,
          user_id: user?.id
        });
        
        // CRITICAL: Request download approval
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
        
        console.log('✅ Download approved:', downloadUrl);
        
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
        
        const filename = `mastered_${fileId}_${downloadFormatAdvanced.toLowerCase()}_${srNum}.${downloadFormatAdvanced.toLowerCase() === 'mp3' ? 'mp3' : 'wav'}`;
        
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
        
        // CRITICAL: Step 4 - Complete download (ONLY after verified success)
        // Professional tier doesn't deduct credits, but we still call complete for tracking
        console.log('💰 Completing download...');
        const completeFormData = new FormData();
        completeFormData.append('file_id', fileId);
        completeFormData.append('tier', 'professional');
        if (user?.id) {
          completeFormData.append('user_id', user.id);
        }
        completeFormData.append('file_size', fileSize.toString());
        completeFormData.append('format', downloadFormatAdvanced);
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
          // File was downloaded but completion failed - user keeps file
          alert(`Warning: File downloaded but completion failed: ${errorMessage}. Please contact support.`);
        } else {
          const completeData = await completeResponse.json();
          console.log('✅ Download completed:', completeData);
        }
        
        // Reset payment status after successful download
      setPaymentCompleted(false);
        
      } else {
        throw new Error('No processed audio URL available. Please process the audio first.');
      }
      
      // CRITICAL: Refresh user state after successful download completion
      if (user?.id) {
        await refreshUser();
        console.log('✅ DownloadStep: User refreshed after successful download completion');
      }
      
      console.log(`✅ Downloaded: ${downloadFormatAdvanced} @ ${sampleRate}`);
      
      // Success - no alert needed, user can see the download in their browser
      
    } catch (error) {
      console.error('❌ Error downloading file:', error);
      
      // Provide more specific error messages
      alert(`Download failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setPaymentCompleted(false); // Reset payment status on error
    } finally {
      setIsDownloadingState(false);
    }
  };

  // Handle payment success callback - continue with download
  const handlePaymentSuccess = () => {
    console.log('✅ Payment completed, continuing with download...');
    setShowPaymentModal(false);
    setPaymentCompleted(true);
    // Don't trigger download automatically - let user click download button
    // This ensures user is authenticated and all state is ready
  };

  // Handle modal close - user cancels payment
  const handlePaymentModalClose = () => {
    console.log('❌ Payment modal closed by user');
    setShowPaymentModal(false);
    // Stay on the same page - no navigation needed
  };

  return (
    <>
      <div className="max-w-4xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={onDownload}
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
                  <span className="text-white font-medium">{(originalFile.size / 1024 / 1024).toFixed(2)} MB</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-300">Genre:</span>
                  <span className="text-crys-gold font-medium">{genre || 'None'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-300">Processing:</span>
                  <span className="text-green-400 font-medium">Complete</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Export Settings - Same as Advanced tier */}
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
                {['44.1kHz', '48kHz'].map((rate) => (
                  <label
                    key={rate}
                    className="flex items-center justify-between p-2 bg-gray-900 rounded border border-gray-600 cursor-pointer hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="sampleRate"
                        value={rate}
                        checked={sampleRate === rate}
                        onChange={(e) => setSampleRate(e.target.value as any)}
                        className="text-crys-gold"
                        disabled={isDownloadingState}
                      />
                      <div>
                        <div className="text-white text-sm">
                          {rate === '44.1kHz' ? '44.1 kHz (CD standard)' :
                           rate === '48kHz' ? '48 kHz (Professional)' :
                           rate === '88.2kHz' ? '88.2 kHz (High-res)' :
                           rate === '96kHz' ? '96 kHz (High-res)' :
                           '192 kHz (Ultra high-res)'}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-white text-sm">$0.00</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Format Selection */}
            <div>
              <h4 className="text-sm font-semibold text-white mb-2">Download Format</h4>
              <div className="space-y-2">
                {[
                  { value: 'MP3', label: 'MP3', desc: 'Compressed' },
                  { value: 'WAV', label: 'WAV (24-bit)', desc: 'Studio quality' }
                ].map((format) => (
                  <label
                    key={format.value}
                    className="flex items-center justify-between p-2 bg-gray-900 rounded border border-gray-600 cursor-pointer hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="format"
                        value={format.value}
                        checked={downloadFormatAdvanced === format.value}
                        onChange={(e) => handleFormatChange(e.target.value as any)}
                        className="text-crys-gold"
                        disabled={isDownloadingState}
                      />
                      <div>
                        <div className="text-white text-sm">{format.label}</div>
                        <div className="text-xs text-gray-400">{format.desc}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-white text-sm">$0.00</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Download Button */}
        <div className="text-center">
          <button
            onClick={handleDownload}
            disabled={!originalFile || isDownloadingState}
            className={`bg-crys-gold text-black px-6 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2 mx-auto ${
              originalFile && !isDownloadingState
                ? 'hover:bg-yellow-400'
                : 'opacity-50 cursor-not-allowed'
            }`}
          >
            {isDownloadingState ? (
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
          
          {originalFile && (
            <div className="mt-2 text-xs text-gray-400">
              Format: {downloadFormatAdvanced === 'MP3' ? 'MP3 320kbps' : 'WAV 24-bit'} • Sample Rate: {sampleRate}
            </div>
          )}
        </div>
      </div>

      {/* Payment Modal - Inline interception, no redirect */}
      <DownloadPaymentModal
        isOpen={showPaymentModal}
        onPaymentSuccess={handlePaymentSuccess}
        onClose={handlePaymentModalClose}
        downloadFormat={downloadFormatAdvanced}
        sampleRate={sampleRate}
        processedAudioUrl={processedAudioUrl}
        originalFile={originalFile}
        genre={genre}
      />
    </>
  );
};

export default DownloadStep;
