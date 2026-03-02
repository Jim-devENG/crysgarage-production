import React, { useState, useRef, useEffect } from 'react';
import { Download, ArrowLeft, CheckCircle, Loader2, Info, Sparkles, RotateCcw } from 'lucide-react';
import { useAuth } from '../../contexts/AuthenticationContext';

interface FreeTierDownloadProps {
  masteredUrl: string;
  onBack: () => void;
  onComplete: () => void;
}

const FreeTierDownload: React.FC<FreeTierDownloadProps> = ({ 
  masteredUrl, 
  onBack, 
  onComplete 
}) => {
  // CRITICAL: Get user from AuthenticationContext - this is the SINGLE SOURCE OF TRUTH
  // Do NOT use tokenManager, localStorage, or any other source for credits
  const { user, refreshUser } = useAuth();
  
  // CRITICAL: Use ref to store latest user from context for handler access
  // This ensures handler always reads latest state, not stale closure
  const userRef = useRef(user);
  const refreshUserRef = useRef(refreshUser);
  
  // Update refs when context changes
  useEffect(() => {
    userRef.current = user;
    refreshUserRef.current = refreshUser;
  }, [user, refreshUser]);
  
  const [downloadFormat, setDownloadFormat] = useState<'WAV16' | 'WAV24' | 'MP3' | 'FLAC'>('WAV16');
  const [downloadSampleRate, setDownloadSampleRate] = useState<44100 | 48000>(44100);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadStatus, setDownloadStatus] = useState<'ready' | 'preparing' | 'converting' | 'completed' | 'error'>('ready');

  // CRITICAL: Download handler - backend is authoritative for credit checks
  // Frontend does NOT check credits - backend validates and deducts atomically
  // This ensures credits are only deducted on successful backend-approved download
  const handleDownload = async () => {
    // CRITICAL: Prevent double-click downloads
    if (isDownloading) {
      console.warn('⚠️ Download already in progress, ignoring duplicate click');
      return;
    }

    // CRITICAL: Read user from ref (always latest from AuthenticationContext)
    const authUser = userRef.current;
    
    if (!authUser?.id) {
      console.error('❌ FreeTierDownload: No user ID - user not authenticated');
      alert('Please sign in to download');
      return;
    }

    setIsDownloading(true);
    setDownloadStatus('preparing');
    
    try {
      // Extract file_id from masteredUrl with pattern: /files/{tier}/mastered_{uuid}.wav
      const match = masteredUrl.match(/mastered_([a-f0-9\-]+)\.wav$/i);
      const fileId = match ? match[1] : null;
      
      if (!fileId) {
        console.error('❌ FreeTierDownload: Could not extract file_id from URL:', masteredUrl);
        throw new Error('Invalid file URL - file_id not found');
      }
      
      setDownloadStatus('converting');
      
      // CRITICAL: Always use HTTPS in production to avoid mixed content warnings
      const baseUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://localhost:8002' 
        : 'https://crysgarage.studio';
      
      // CRITICAL: Step 1 - Request download approval (checks credits, does NOT deduct)
      const requestFormData = new FormData();
      requestFormData.append('file_id', fileId);
      requestFormData.append('format', downloadFormat.toUpperCase());
      requestFormData.append('sample_rate', downloadSampleRate.toString());
      requestFormData.append('tier', 'free');
      requestFormData.append('bit_depth', downloadFormat === 'WAV24' ? '24' : '16');
      requestFormData.append('user_id', authUser.id);
      
      console.log('📥 FreeTierDownload: Requesting download approval (credit check only):', {
        file_id: fileId,
        format: downloadFormat,
        sample_rate: downloadSampleRate,
        user_id: authUser.id
      });
      
      // CRITICAL: Request download approval - backend checks credits but does NOT deduct
      const requestResponse = await fetch(`${baseUrl}/downloads/request`, {
        method: 'POST',
        body: requestFormData,
      });
      
      // CRITICAL: Handle backend errors properly
      if (!requestResponse.ok) {
        const errorText = await requestResponse.text();
        let errorMessage = 'Download request failed';
        
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.detail || errorData.message || errorMessage;
        } catch {
          errorMessage = errorText || `Server error: ${requestResponse.status} ${requestResponse.statusText}`;
        }
        
        console.error('❌ Backend download request error:', {
          status: requestResponse.status,
          statusText: requestResponse.statusText,
          error: errorMessage
        });
        
        setDownloadStatus('error');
        alert(errorMessage);
        
        // Refresh user state to get current credit balance
        try {
          await refreshUserRef.current();
        } catch (refreshError) {
          console.error('❌ Failed to refresh user after download error:', refreshError);
        }
        
        return;
      }
      
      const requestData = await requestResponse.json();
      const downloadUrl = requestData.download_url;
      
      if (!downloadUrl) {
        throw new Error('Backend did not return download URL');
      }
      
      console.log('✅ Download approved (credits checked, not deducted yet):', downloadUrl);
      
      // CRITICAL: Step 2 - Download file using fetch to verify success
      // We MUST verify the download succeeded before deducting credits
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
      
      // Generate filename based on format
      const formatLower = downloadFormat.toLowerCase();
      const formatExt = formatLower === 'mp3' ? 'mp3' :
                       formatLower === 'flac' ? 'flac' :
                       formatLower === 'aiff' ? 'aiff' :
                       formatLower === 'aac' ? 'aac' :
                       formatLower === 'ogg' ? 'ogg' : 'wav';
      const filename = `mastered_${fileId}_${formatLower}_${downloadSampleRate}.${formatExt}`;
      
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
      completeFormData.append('tier', 'free');
      completeFormData.append('user_id', authUser.id);
      completeFormData.append('file_size', fileSize.toString());
      completeFormData.append('format', downloadFormat.toUpperCase());
      completeFormData.append('sample_rate', downloadSampleRate.toString());
      
      const completeResponse = await fetch(`${baseUrl}/downloads/complete`, {
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
        alert(`Warning: File downloaded but credit deduction failed: ${errorMessage}. Please contact support.`);
      } else {
        const completeData = await completeResponse.json();
        console.log('✅ Download completed and credits deducted:', completeData);
      }
      
      setDownloadStatus('completed');
      
      // CRITICAL: Refresh user state after successful download completion
      try {
        await refreshUserRef.current();
        console.log('✅ FreeTierDownload: User refreshed after successful download completion');
      } catch (refreshError) {
        console.error('❌ Failed to refresh user after download completion:', refreshError);
      }
      
    } catch (error) {
      console.error('❌ Download failed:', error);
      setDownloadStatus('error');
      
      const errorMessage = error instanceof Error ? error.message : 'Download failed. Please try again.';
      alert(errorMessage);
      
      // Refresh user state to get current credit balance
      try {
        await refreshUserRef.current();
      } catch (refreshError) {
        console.error('❌ Failed to refresh user after download error:', refreshError);
      }
    } finally {
      setIsDownloading(false);
    }
  };

  const formatOptions = [
    { format: 'WAV16', label: 'WAV 16-bit', desc: 'Standard quality' },
    { format: 'WAV24', label: 'WAV 24-bit', desc: 'High quality' },
    { format: 'MP3', label: 'MP3', desc: 'Compressed' },
    { format: 'FLAC', label: 'FLAC', desc: 'Lossless' }
  ];

  const sampleRateOptions = [
    { rate: 44100, label: '44.1 kHz', desc: 'CD Quality' },
    { rate: 48000, label: '48 kHz', desc: 'Professional' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-crys-black via-crys-charcoal to-crys-graphite text-white p-6 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-20 w-40 h-40 border-2 border-crys-gold/30 rounded-full animate-spin" style={{animationDuration: '20s'}}></div>
        <div className="absolute bottom-20 right-20 w-32 h-32 border-2 border-crys-gold/30 rounded-full animate-spin" style={{animationDuration: '15s', animationDirection: 'reverse'}}></div>
      </div>

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center space-x-3 mb-6">
            <div className="w-14 h-14 bg-gradient-to-br from-crys-gold to-crys-gold-muted rounded-full flex items-center justify-center">
              <Download className="w-7 h-7 text-crys-black" />
            </div>
            <div className="text-left">
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-crys-gold via-crys-gold to-crys-gold-muted bg-clip-text text-transparent">
                Download Center
              </h1>
              <p className="text-crys-light-grey text-sm mt-1">Export your mastered audio</p>
            </div>
          </div>
        </div>

        {/* Status Panel */}
        <div className="bg-gradient-to-br from-crys-graphite/60 to-crys-charcoal/60 backdrop-blur-sm rounded-2xl p-6 border border-crys-gold/20 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {downloadStatus === 'completed' && <CheckCircle className="w-6 h-6 text-green-500" />}
              {downloadStatus === 'ready' && <div className="w-2 h-2 bg-crys-gold rounded-full animate-pulse"></div>}
              {(downloadStatus === 'preparing' || downloadStatus === 'converting') && <Loader2 className="w-6 h-6 text-crys-gold animate-spin" />}
              {downloadStatus === 'error' && <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>}
              <div>
                <p className="text-sm text-crys-light-grey/70">Status</p>
                <p className={`font-semibold ${
                  downloadStatus === 'completed' ? 'text-green-500' :
                  downloadStatus === 'error' ? 'text-red-400' :
                  downloadStatus === 'ready' ? 'text-crys-gold' :
                  'text-blue-400'
                }`}>
                  {downloadStatus === 'ready' && 'Ready to download'}
                  {downloadStatus === 'preparing' && 'Preparing file...'}
                  {downloadStatus === 'converting' && 'Converting format...'}
                  {downloadStatus === 'completed' && 'Download started'}
                  {downloadStatus === 'error' && 'Download failed'}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-crys-light-grey/70">Format</p>
              <p className="font-bold text-crys-gold">{downloadFormat}</p>
            </div>
          </div>
        </div>

        {/* Configuration */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Format Selection */}
          <div className="bg-gradient-to-br from-crys-graphite/60 to-crys-charcoal/60 backdrop-blur-sm rounded-2xl p-6 border border-crys-gold/20">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-crys-gold" />
              <h3 className="text-lg font-bold text-crys-white">Audio Format</h3>
            </div>
            <p className="text-sm text-crys-light-grey/70 mb-4">Choose output format</p>
            
            <div className="grid grid-cols-2 gap-3">
              {formatOptions.map((option) => (
                <button
                  key={option.format}
                  onClick={() => setDownloadFormat(option.format as any)}
                  disabled={isDownloading}
                  className={`p-3 rounded-lg text-left transition-all duration-200 ${
                    downloadFormat === option.format
                      ? 'bg-gradient-to-r from-crys-gold to-crys-gold-muted text-crys-black'
                      : 'bg-crys-charcoal/50 text-crys-white hover:bg-crys-charcoal/70 border border-crys-graphite'
                  } ${isDownloading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className="font-semibold text-sm">{option.label}</div>
                  <div className={`text-xs ${downloadFormat === option.format ? 'text-crys-black/70' : 'text-crys-light-grey/60'}`}>
                    {option.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Sample Rate Selection */}
          <div className="bg-gradient-to-br from-crys-graphite/60 to-crys-charcoal/60 backdrop-blur-sm rounded-2xl p-6 border border-crys-gold/20">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-crys-gold" />
              <h3 className="text-lg font-bold text-crys-white">Sample Rate</h3>
            </div>
            <p className="text-sm text-crys-light-grey/70 mb-4">Choose sample rate</p>
            
            <div className="space-y-3">
              {sampleRateOptions.map((option) => (
                <button
                  key={option.rate}
                  onClick={() => setDownloadSampleRate(option.rate as any)}
                  disabled={isDownloading}
                  className={`w-full p-3 rounded-lg text-left transition-all duration-200 ${
                    downloadSampleRate === option.rate
                      ? 'bg-gradient-to-r from-crys-gold to-crys-gold-muted text-crys-black'
                      : 'bg-crys-charcoal/50 text-crys-white hover:bg-crys-charcoal/70 border border-crys-graphite'
                  } ${isDownloading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className="font-semibold text-sm">{option.label}</div>
                  <div className={`text-xs ${downloadSampleRate === option.rate ? 'text-crys-black/70' : 'text-crys-light-grey/60'}`}>
                    {option.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Action Panel */}
        <div className="bg-gradient-to-br from-crys-graphite/60 to-crys-charcoal/60 backdrop-blur-sm rounded-2xl p-8 border border-crys-gold/20 text-center mb-6">
          <h3 className="text-xl font-bold mb-2 text-crys-white">Ready to Export</h3>
          <p className="text-crys-light-grey/70 mb-6">
            Your mastered track is ready for download
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onBack}
              className="bg-crys-graphite hover:bg-crys-graphite/80 text-crys-white px-6 py-3 rounded-lg font-semibold transition-all inline-flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            
            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className={`px-10 py-3 rounded-lg font-bold transition-all inline-flex items-center gap-2 ${
                isDownloading
                  ? 'bg-crys-graphite text-crys-light-grey/40 cursor-not-allowed'
                  : 'bg-gradient-to-r from-crys-gold to-crys-gold-muted text-crys-black hover:shadow-lg hover:shadow-crys-gold/20 hover:scale-105'
              }`}
            >
              {isDownloading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  Download File
                </>
              )}
            </button>
            
            <button
              onClick={onComplete}
              className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all inline-flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              New Project
            </button>
          </div>
        </div>

        {/* Info Panel */}
        <div className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 backdrop-blur-sm rounded-2xl p-6 border border-blue-500/20">
          <div className="flex items-center gap-3 mb-4">
            <Info className="w-5 h-5 text-blue-400" />
            <h4 className="text-base font-bold text-blue-400">Download Information</h4>
          </div>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-crys-light-grey/80">
            <div>
              <p className="font-semibold text-crys-white mb-2">File Details:</p>
              <ul className="space-y-1.5">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-crys-gold rounded-full"></span>
                  Format: {downloadFormat}
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-crys-gold rounded-full"></span>
                  Sample Rate: {downloadSampleRate} Hz
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-crys-gold rounded-full"></span>
                  Quality: High Definition
                </li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-crys-white mb-2">Processing:</p>
              <ul className="space-y-1.5">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-crys-gold rounded-full"></span>
                  Engine: Matchering 2.0
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-crys-gold rounded-full"></span>
                  Mode: Professional Grade
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-crys-gold rounded-full"></span>
                  Compatibility: Universal
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FreeTierDownload;
