/**
 * Advanced Download Handler
 * Based on the advanced tier's perfect download implementation
 */

export interface DownloadOptions {
  originalFile: File;
  processedAudioUrl: string | null;
  downloadFormat: string;
  sampleRate: string;
  genre?: string;
  userId?: string; // CRITICAL: Required for credit-based tiers (free, advanced)
}

// Helper function to generate filename
const generateFilename = (
  originalName: string,
  downloadFormat: string,
  sampleRate: string,
  genre?: string
): string => {
  const nameWithoutExt = originalName.replace(/\.[^/.]+$/, '');
  const formatExt =
    downloadFormat === 'MP3' ? 'mp3' :
    downloadFormat === 'FLAC' ? 'flac' :
    downloadFormat === 'AIFF' ? 'aiff' :
    downloadFormat === 'AAC' ? 'aac' :
    downloadFormat === 'OGG' ? 'ogg' :
    'wav';
  const bitDepth = downloadFormat === 'WAV' ? '24bit' : '';
  const sampleRateLabel = sampleRate.replace('kHz', 'k');

  const filename =
    downloadFormat === 'MP3'
      ? `${nameWithoutExt}_garage_mastered_320kbps_${sampleRateLabel}.${formatExt}`
      : downloadFormat === 'AAC'
        ? `${nameWithoutExt}_garage_mastered_256kbps_${sampleRateLabel}.${formatExt}`
        : downloadFormat === 'WAV' || downloadFormat === 'AIFF'
          ? `${nameWithoutExt}_garage_mastered_${bitDepth}_${sampleRateLabel}.${formatExt}`
          : `${nameWithoutExt}_garage_mastered_${sampleRateLabel}.${formatExt}`;

  // Add genre to filename if available
  return genre 
    ? filename.replace('_garage_mastered_', `_garage_${genre.toLowerCase()}_mastered_`)
    : filename;
};

export const createAdvancedDownloadHandler = () => {
  return async (options: DownloadOptions): Promise<void> => {
    const { originalFile, processedAudioUrl, downloadFormat, sampleRate, genre, userId } = options;

    if (!originalFile) {
      throw new Error('No original file available for processing');
    }

    if (!processedAudioUrl) {
      throw new Error('No processed audio URL available. Please process the audio first.');
    }

    // CRITICAL: Determine base URL with HTTPS enforcement
    const base = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
      ? 'http://localhost:8002'
      : 'https://crysgarage.studio';
    
    // CRITICAL: Extract file_id from processedAudioUrl
    // Pattern: /files/{tier}/mastered_{file_id}.wav
    const match = processedAudioUrl.match(/mastered_([a-f0-9\-]+)\.wav$/i);
    const fileId = match ? match[1] : null;
    
    if (!fileId) {
      throw new Error('Could not extract file_id from processed audio URL. Expected format: /files/{tier}/mastered_{file_id}.wav');
    }
    
    // CRITICAL: ALWAYS use /api/v1/download/{file_id} for format conversion
    // This endpoint handles ALL formats (WAV, MP3, FLAC, etc.) and sample rates
    // Even WAV needs conversion if bit depth (WAV16/WAV24) or sample rate differs
    const srNum = Math.round(parseFloat(sampleRate.replace('kHz', '')) * 1000);
    const formatLower = downloadFormat.toLowerCase();
    
    // Map format names to backend format
    const formatMap: Record<string, string> = {
      'mp3': 'mp3',
      'wav': 'wav',
      'wav16': 'wav',
      'wav24': 'wav',
      'flac': 'flac',
      'aiff': 'aiff',
      'aac': 'aac',
      'ogg': 'ogg'
    };
    
    const backendFormat = formatMap[formatLower] || 'wav';
    
    // Determine bit depth from format
    let bitDepth = 16; // Default
    if (formatLower === 'wav16') {
      bitDepth = 16;
    } else if (formatLower === 'wav24') {
      bitDepth = 24;
    } else if (formatLower === 'wav') {
      // Default WAV is 16-bit, but check if we need 24-bit
      // For now, default to 16-bit for plain 'WAV'
      bitDepth = 16;
    }
    
    // CRITICAL: Step 1 - Request download approval (checks credits, does NOT deduct)
    // Determine tier from processedAudioUrl or default to 'advanced'
    const tier = processedAudioUrl.includes('/professional/') ? 'professional' :
                 processedAudioUrl.includes('/free/') ? 'free' : 'advanced';
    
    const requestFormData = new FormData();
    requestFormData.append('file_id', fileId);
    requestFormData.append('format', backendFormat.toUpperCase());
    requestFormData.append('sample_rate', srNum.toString());
    requestFormData.append('tier', tier);
    requestFormData.append('bit_depth', bitDepth.toString());
    
    // CRITICAL: Professional tier doesn't require user_id for download request
    // Only free and advanced tiers need user_id for credit checks
    if (tier === 'professional') {
      // Professional tier: user_id is optional (payment already completed)
      if (userId) {
        requestFormData.append('user_id', userId);
      } else {
        console.warn('⚠️ Professional tier download: No user_id provided, but continuing (payment already completed)');
      }
    } else {
      // Free/Advanced tier: user_id is required for credit checks
      if (!userId) {
        throw new Error('User ID is required for download. Please sign in.');
      }
      requestFormData.append('user_id', userId);
    }
    
    console.log('📥 AdvancedDownloadHandler: Requesting download approval (credit check only):', {
      fileId,
      format: backendFormat,
      sampleRate: srNum,
      tier,
      userId,
      url: `${base}/downloads/request`
    });
    
    // CRITICAL: Request download approval - backend checks credits but does NOT deduct
    let requestResponse;
    try {
      requestResponse = await fetch(`${base}/downloads/request`, {
        method: 'POST',
        body: requestFormData,
      });
    } catch (fetchError) {
      console.error('❌ AdvancedDownloadHandler: Fetch error calling /downloads/request:', fetchError);
      throw new Error(`Failed to connect to download server: ${fetchError instanceof Error ? fetchError.message : 'Unknown error'}`);
    }
    
    if (!requestResponse.ok) {
      const errorText = await requestResponse.text();
      console.error('❌ AdvancedDownloadHandler: /downloads/request failed:', {
        status: requestResponse.status,
        statusText: requestResponse.statusText,
        errorText: errorText.slice(0, 500)
      });
      let errorMessage = 'Download request failed';
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.detail || errorData.message || errorMessage;
      } catch {
        errorMessage = errorText || `Server error: ${requestResponse.status}`;
      }
      throw new Error(errorMessage);
    }
    
    const requestData = await requestResponse.json();
    console.log('✅ AdvancedDownloadHandler: /downloads/request response:', requestData);
    const downloadUrl = requestData.download_url;
    
    if (!downloadUrl) {
      console.error('❌ AdvancedDownloadHandler: Backend did not return download_url in response:', requestData);
      throw new Error('Backend did not return download URL');
    }
    
    console.log('✅ Download approved (credits checked, not deducted yet):', downloadUrl);
    
    // CRITICAL: Step 2 - Download file using fetch to verify success
    console.log('📥 Downloading file to verify success from URL:', downloadUrl);
    let downloadResponse;
    try {
      downloadResponse = await fetch(downloadUrl);
    } catch (fetchError) {
      console.error('❌ AdvancedDownloadHandler: Fetch error downloading file:', {
        error: fetchError,
        url: downloadUrl,
        message: fetchError instanceof Error ? fetchError.message : 'Unknown error'
      });
      throw new Error(`Failed to download file: ${fetchError instanceof Error ? fetchError.message : 'Unknown error'}`);
    }
    
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
    
    const filename = generateFilename(originalFile.name, downloadFormat, sampleRate, genre);
    
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
    // Note: For professional tier, this is a no-op (no credits deducted)
    if (tier === 'free' || tier === 'advanced') {
      console.log('💰 Completing download and deducting credits...');
      const completeFormData = new FormData();
      completeFormData.append('file_id', fileId);
      completeFormData.append('tier', tier);
      if (!userId) {
        throw new Error('User ID is required for download completion. Please sign in.');
      }
      completeFormData.append('user_id', userId);
      completeFormData.append('file_size', fileSize.toString());
      completeFormData.append('format', backendFormat.toUpperCase());
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
    }
    
    console.log(`✅ Download completed: ${filename} (format: ${backendFormat}, sample rate: ${srNum}Hz, bit depth: ${bitDepth}bit)`);
  };
};

export default createAdvancedDownloadHandler;

    requestFormData.append('tier', tier);
    requestFormData.append('bit_depth', bitDepth.toString());
      if (!userId) {
        throw new Error('User ID is required for download. Please sign in.');
      }
      requestFormData.append('user_id', userId);
    
    console.log('📥 AdvancedDownloadHandler: Requesting download approval (credit check only):', {
      fileId,
      format: backendFormat,
      sampleRate: srNum,
      tier,
      userId,
      url: `${base}/downloads/request`
    });
    
    // CRITICAL: Request download approval - backend checks credits but does NOT deduct
    let requestResponse;
    try {
      requestResponse = await fetch(`${base}/downloads/request`, {
        method: 'POST',
        body: requestFormData,
      });
    } catch (fetchError) {
      console.error('❌ AdvancedDownloadHandler: Fetch error calling /downloads/request:', fetchError);
      throw new Error(`Failed to connect to download server: ${fetchError instanceof Error ? fetchError.message : 'Unknown error'}`);
    }
    
    if (!requestResponse.ok) {
      const errorText = await requestResponse.text();
      console.error('❌ AdvancedDownloadHandler: /downloads/request failed:', {
        status: requestResponse.status,
        statusText: requestResponse.statusText,
        errorText: errorText.slice(0, 500)
      });
      let errorMessage = 'Download request failed';
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.detail || errorData.message || errorMessage;
      } catch {
        errorMessage = errorText || `Server error: ${requestResponse.status}`;
      }
      throw new Error(errorMessage);
    }
    
    const requestData = await requestResponse.json();
    console.log('✅ AdvancedDownloadHandler: /downloads/request response:', requestData);
    const downloadUrl = requestData.download_url;
    
    if (!downloadUrl) {
      console.error('❌ AdvancedDownloadHandler: Backend did not return download_url in response:', requestData);
      throw new Error('Backend did not return download URL');
    }
    
    console.log('✅ Download approved (credits checked, not deducted yet):', downloadUrl);
    
    // CRITICAL: Step 2 - Download file using fetch to verify success
    console.log('📥 Downloading file to verify success from URL:', downloadUrl);
    let downloadResponse;
    try {
      downloadResponse = await fetch(downloadUrl);
    } catch (fetchError) {
      console.error('❌ AdvancedDownloadHandler: Fetch error downloading file:', {
        error: fetchError,
        url: downloadUrl,
        message: fetchError instanceof Error ? fetchError.message : 'Unknown error'
      });
      throw new Error(`Failed to download file: ${fetchError instanceof Error ? fetchError.message : 'Unknown error'}`);
    }
    
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
    
    const filename = generateFilename(originalFile.name, downloadFormat, sampleRate, genre);
    
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
    // Note: For professional tier, this is a no-op (no credits deducted)
    if (tier === 'free' || tier === 'advanced') {
      console.log('💰 Completing download and deducting credits...');
      const completeFormData = new FormData();
      completeFormData.append('file_id', fileId);
      completeFormData.append('tier', tier);
      if (!userId) {
        throw new Error('User ID is required for download completion. Please sign in.');
      }
      completeFormData.append('user_id', userId);
      completeFormData.append('file_size', fileSize.toString());
      completeFormData.append('format', backendFormat.toUpperCase());
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
    }
    
    console.log(`✅ Download completed: ${filename} (format: ${backendFormat}, sample rate: ${srNum}Hz, bit depth: ${bitDepth}bit)`);
  };
};

export default createAdvancedDownloadHandler;