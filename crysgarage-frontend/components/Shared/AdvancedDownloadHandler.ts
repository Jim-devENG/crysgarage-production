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
}

export const createAdvancedDownloadHandler = () => {
  return async (options: DownloadOptions): Promise<void> => {
    const { originalFile, processedAudioUrl, downloadFormat, sampleRate, genre } = options;

    if (!originalFile) {
      throw new Error('No original file available for processing');
    }

    console.log('🎵 Advanced download starting — backend FFmpeg proxy');

    // Prefer server-processed URL and let FFmpeg proxy convert it
    let audioToDownload: File | Blob = originalFile;
    let audioUrl = URL.createObjectURL(originalFile);

    if (processedAudioUrl) {
      const base = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
        ? 'http://localhost:8002'
        : 'https://crysgarage.studio';
      
      const srNum = Math.round(parseFloat(sampleRate.replace('kHz', '')) * 1000);
      const sourceUrl = processedAudioUrl.startsWith('/files') ? `${base}${processedAudioUrl}` : processedAudioUrl;
      const proxyUrl = `${base}/proxy-download?file_url=${encodeURIComponent(sourceUrl)}&format=${downloadFormat}&sample_rate=${srNum}`;
      
      console.log('Fetching from proxy:', proxyUrl);
      
      const response = await fetch(proxyUrl);
      if (!response.ok) {
        throw new Error(`Proxy conversion failed: ${response.status} ${response.statusText}`);
      }
      
      const convertedBlob = await response.blob();
      if (!convertedBlob || convertedBlob.size < 1024) {
        throw new Error(`Downloaded blob too small (${convertedBlob.size || 0} bytes)`);
      }
      
      audioToDownload = convertedBlob;
      audioUrl = URL.createObjectURL(convertedBlob);
    } else {
      throw new Error('No processed audio URL available. Please process the audio first.');
    }

    // Create download link with processed audio
    const link = document.createElement('a');
    link.href = audioUrl;

    // Generate filename with format info (same as advanced tier)
    const originalName = originalFile.name;
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
    const finalFilename = genre 
      ? filename.replace('_garage_mastered_', `_garage_${genre.toLowerCase()}_mastered_`)
      : filename;

    link.download = finalFilename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up
    URL.revokeObjectURL(audioUrl);

    console.log(`✅ Downloaded: ${finalFilename} (${downloadFormat} @ ${sampleRate})`);
  };
};

export default createAdvancedDownloadHandler;
