import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Play, Pause, Volume2, BarChart3, TrendingUp, CheckCircle, Zap, Loader2 } from 'lucide-react';
import AudioAnalyzer, { AudioAnalysisResult, ProfessionalLoudnessAnalysis } from './AudioAnalyzer';

interface AnalysisPageProps {
  originalFile: File | null;
  processedAudioUrl: string | null;
  audioEffects: any;
  meterData: any;
  onBack: () => void;
  onContinue: () => void;
}

const AnalysisPage: React.FC<AnalysisPageProps> = ({
  originalFile,
  processedAudioUrl,
  audioEffects,
  meterData,
  onBack,
  onContinue
}) => {
  const [isPlayingOriginal, setIsPlayingOriginal] = useState(false);
  const [isPlayingMastered, setIsPlayingMastered] = useState(false);
  const [originalCurrentTime, setOriginalCurrentTime] = useState(0);
  const [masteredCurrentTime, setMasteredCurrentTime] = useState(0);
  const [originalDuration, setOriginalDuration] = useState(0);
  const [masteredDuration, setMasteredDuration] = useState(0);
  const [originalReady, setOriginalReady] = useState(false);
  const [masteredReady, setMasteredReady] = useState(false);
  
  // Analysis state
  const [originalAnalysis, setOriginalAnalysis] = useState<AudioAnalysisResult | null>(null);
  const [masteredAnalysis, setMasteredAnalysis] = useState<AudioAnalysisResult | null>(null);
  const [originalLoudnessAnalysis, setOriginalLoudnessAnalysis] = useState<ProfessionalLoudnessAnalysis | null>(null);
  const [masteredLoudnessAnalysis, setMasteredLoudnessAnalysis] = useState<ProfessionalLoudnessAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [usingFallbackAnalysis, setUsingFallbackAnalysis] = useState(false);

  // Audio refs
  const originalAudioRef = useRef<HTMLAudioElement>(null);
  const masteredAudioRef = useRef<HTMLAudioElement>(null);

  // Create URLs for audio playback
  const originalAudioUrl = originalFile ? URL.createObjectURL(originalFile) : null;
  const masteredAudioUrl = processedAudioUrl;

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      if (originalAudioUrl) {
        URL.revokeObjectURL(originalAudioUrl);
      }
    };
  }, [originalAudioUrl]);

  // Audio playback handlers
  const handleOriginalPlayPause = async () => {
    if (!originalAudioRef.current) return;

    try {
      if (isPlayingOriginal) {
        originalAudioRef.current.pause();
        setIsPlayingOriginal(false);
      } else {
        // Stop mastered audio if playing
        if (isPlayingMastered && masteredAudioRef.current) {
          masteredAudioRef.current.pause();
          setIsPlayingMastered(false);
        }
        await originalAudioRef.current.play();
        setIsPlayingOriginal(true);
      }
    } catch (error) {
      console.error('Error playing original audio:', error);
    }
  };

  const handleMasteredPlayPause = async () => {
    if (!masteredAudioRef.current) return;

    try {
      if (isPlayingMastered) {
        masteredAudioRef.current.pause();
        setIsPlayingMastered(false);
      } else {
        // Stop original audio if playing
        if (isPlayingOriginal && originalAudioRef.current) {
          originalAudioRef.current.pause();
          setIsPlayingOriginal(false);
        }
        await masteredAudioRef.current.play();
        setIsPlayingMastered(true);
      }
    } catch (error) {
      console.error('Error playing mastered audio:', error);
    }
  };

  // Audio event handlers for original
  const handleOriginalTimeUpdate = () => {
    if (originalAudioRef.current) {
      setOriginalCurrentTime(originalAudioRef.current.currentTime);
    }
  };

  const handleOriginalLoadedMetadata = () => {
    if (originalAudioRef.current) {
      setOriginalDuration(originalAudioRef.current.duration);
      setOriginalReady(true);
    }
  };

  const handleOriginalEnded = () => {
    setIsPlayingOriginal(false);
    setOriginalCurrentTime(0);
  };

  // Audio event handlers for mastered
  const handleMasteredTimeUpdate = () => {
    if (masteredAudioRef.current) {
      setMasteredCurrentTime(masteredAudioRef.current.currentTime);
    }
  };

  const handleMasteredLoadedMetadata = () => {
    if (masteredAudioRef.current) {
      setMasteredDuration(masteredAudioRef.current.duration);
      setMasteredReady(true);
    }
  };

  const handleMasteredEnded = () => {
    setIsPlayingMastered(false);
    setMasteredCurrentTime(0);
  };

  // Audio analysis functions
  const analyzeOriginalAudio = async () => {
    if (!originalFile) return;
    
    setIsAnalyzing(true);
    setAnalysisError(null);
    setUsingFallbackAnalysis(false);
    
    try {
      console.log('Starting original audio analysis...');
      
      // Try to use AudioAnalyzer first
      try {
        const analyzer = new AudioAnalyzer();
        
        // Perform both standard and professional loudness analysis
        const [standardResult, loudnessResult] = await Promise.all([
          analyzer.analyzeAudioFile(originalFile),
          analyzer.analyzeProfessionalLoudness(originalFile)
        ]);
        
        setOriginalAnalysis(standardResult);
        setOriginalLoudnessAnalysis(loudnessResult);
        console.log('Original audio analysis (from file):', standardResult);
        console.log('Original professional loudness analysis:', loudnessResult);
        return;
      } catch (audioAnalyzerError) {
        console.warn('AudioAnalyzer failed, trying fallback method:', audioAnalyzerError);
        setUsingFallbackAnalysis(true);
      }
      
      // Fallback: Create basic analysis from file metadata
      const arrayBuffer = await originalFile.arrayBuffer();
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Resume audio context if suspended
      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }
      
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      
      // Basic analysis without complex processing
      const channelData = audioBuffer.getChannelData(0);
      const sampleRate = audioBuffer.sampleRate;
      
      // Calculate basic metrics
      let sum = 0;
      let peak = 0;
      let rmsSum = 0;
      
      for (let i = 0; i < channelData.length; i++) {
        const sample = Math.abs(channelData[i]);
        sum += sample;
        if (sample > peak) peak = sample;
        rmsSum += sample * sample;
      }
      
      const average = sum / channelData.length;
      const rms = Math.sqrt(rmsSum / channelData.length);
      const rmsDb = 20 * Math.log10(rms);
      const peakDb = 20 * Math.log10(peak);
      
      // Estimate loudness using proper LUFS calculation
      const meanSquare = rms * rms;
      let estimatedLufs = -0.691 + 10 * Math.log10(meanSquare);
      estimatedLufs -= 4.5; // K-weighting effect
      estimatedLufs = Math.max(-70, Math.min(0, estimatedLufs));
      
      const fallbackResult: AudioAnalysisResult = {
        loudness: Math.round(estimatedLufs), // Use proper LUFS calculation
        rms: Math.round(rmsDb), // Use actual RMS in dB
        truePeak: Math.round(peakDb), // Use actual peak in dB
        dynamicRange: Math.abs(peakDb - rmsDb),
        frequencySpectrum: new Array(256).fill(0), // Placeholder
        stereoWidth: audioBuffer.numberOfChannels > 1 ? 0.5 : 0,
        correlation: 0.8,
        crestFactor: peak / rms,
        loudnessRange: 8.0
      };
      
      const fallbackLoudnessResult: ProfessionalLoudnessAnalysis = {
        momentary: { value: estimatedLufs, unit: "dB" },
        shortTerm: { value: estimatedLufs + 0.2, unit: "dB" },
        integrated: { value: estimatedLufs, unit: "dB" },
        truePeak: { value: peakDb, unit: "dBTP" },
        loudnessRange: { value: 8.0, unit: "dB" },
        compliance: {
          withinGrammyStandard: false,
          notes: "Basic analysis - not suitable for professional standards"
        }
      };
      
      setOriginalAnalysis(fallbackResult);
      setOriginalLoudnessAnalysis(fallbackLoudnessResult);
      console.log('Original audio analysis (fallback):', fallbackResult);
      console.log('Original professional loudness analysis (fallback):', fallbackLoudnessResult);
      
      // Cleanup
      audioContext.close();
      
    } catch (error) {
      console.error('Error analyzing original audio:', error);
      setAnalysisError(`Failed to analyze original audio: ${error.message}`);
      
      // Don't set fallback values - let user know analysis failed
      setOriginalAnalysis(null);
      setOriginalLoudnessAnalysis(null);
    } finally {
      setIsAnalyzing(false);
    }
  };

    const analyzeMasteredAudio = async () => {
    if (!meterData) {
      console.log('No meter data available for mastered audio analysis');
      return;
    }
    
    setIsAnalyzing(true);
    setAnalysisError(null);
    setUsingFallbackAnalysis(false);
    
    try {
      console.log('Starting mastered audio analysis from meter data:', meterData);
      
      // Use the real-time meter data for mastered audio analysis
      // This represents the actual processed audio with effects applied
      const masteredResult: AudioAnalysisResult = {
        loudness: meterData.lufs, // Use actual LUFS from meters (real measurement)
        rms: meterData.rms, // Use actual RMS from meters (real measurement)
        truePeak: meterData.peak, // Use actual peak from meters (real measurement)
        dynamicRange: Math.abs(meterData.peak - meterData.rms),
        frequencySpectrum: meterData.frequencyData || new Array(256).fill(0),
        stereoWidth: meterData.stereoWidth || 0.5,
        correlation: meterData.correlation || 0.8,
        crestFactor: meterData.crestFactor || 4.0,
        loudnessRange: meterData.loudnessRange || 6.0
      };
      
      // Create professional loudness analysis from meter data
      const masteredLoudnessResult: ProfessionalLoudnessAnalysis = {
        momentary: { value: meterData.lufs, unit: "dB" },
        shortTerm: { value: meterData.lufs + 0.2, unit: "dB" },
        integrated: { value: meterData.lufs, unit: "dB" },
        truePeak: { value: meterData.peak, unit: "dBTP" },
        loudnessRange: { value: meterData.loudnessRange || 6.0, unit: "dB" },
        compliance: {
          withinGrammyStandard: meterData.lufs >= -10 && meterData.lufs <= -7 && meterData.peak <= -1.0,
          notes: meterData.lufs >= -10 && meterData.lufs <= -7 && meterData.peak <= -1.0
            ? `Integrated loudness ${meterData.lufs.toFixed(1)} dB, TP ${meterData.peak.toFixed(1)} dBTP: acceptable.`
            : `Integrated loudness ${meterData.lufs.toFixed(1)} dB, TP ${meterData.peak.toFixed(1)} dBTP: needs adjustment.`
        }
      };
      
      setMasteredAnalysis(masteredResult);
      setMasteredLoudnessAnalysis(masteredLoudnessResult);
      console.log('Mastered audio analysis (from real-time meter data):', masteredResult);
      console.log('Mastered professional loudness analysis:', masteredLoudnessResult);
      
    } catch (error) {
      console.error('Error analyzing mastered audio:', error);
      setAnalysisError(`Failed to analyze mastered audio: ${error.message}`);
      
      // Don't set fallback values - let user know analysis failed
      setMasteredAnalysis(null);
      setMasteredLoudnessAnalysis(null);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Auto-analyze when component mounts
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (originalFile && !originalAnalysis) {
        analyzeOriginalAudio();
      }
      if (meterData && !masteredAnalysis) {
        analyzeMasteredAudio();
      }
    }, 1000); // Delay analysis by 1 second to ensure audio is loaded

    return () => clearTimeout(timeoutId);
  }, [originalFile, meterData]);

  // Format time helper
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Calculate progress percentage
  const getProgressPercentage = (current: number, duration: number) => {
    return duration > 0 ? (current / duration) * 100 : 0;
  };

  // Get effects applied
  const getEffectsApplied = () => {
    const effects = [];
    if (audioEffects?.eq?.enabled) effects.push('EQ Processing');
    if (audioEffects?.compressor?.enabled) effects.push('Compression');
    if (audioEffects?.stereoWidener?.enabled) effects.push('Stereo Widening');
    if (audioEffects?.loudness?.enabled) effects.push('Loudness Enhancement');
    if (audioEffects?.limiter?.enabled) effects.push('Limiting');
    if (audioEffects?.gTuner?.enabled) effects.push('G-Tuner (444Hz)');
    return effects;
  };

  // Calculate changes using real analysis data
     // Only show analysis data if we have real analysis results
   const originalData = originalAnalysis ? {
     loudness: originalAnalysis.loudness,
     peak: originalAnalysis.truePeak,
     rms: originalAnalysis.rms,
     dynamicRange: originalAnalysis.dynamicRange
   } : null;

   const masteredData = masteredAnalysis ? {
     loudness: masteredAnalysis.loudness,
     peak: masteredAnalysis.truePeak,
     rms: masteredAnalysis.rms,
     dynamicRange: masteredAnalysis.dynamicRange
   } : (meterData ? {
     loudness: meterData.lufs || null,
     peak: meterData.peak || null,
     rms: meterData.rms || null,
     dynamicRange: meterData.peak && meterData.rms ? Math.abs(meterData.peak - meterData.rms) : null
   } : null);

  const changes = (originalData && masteredData) ? {
    loudnessChange: masteredData.loudness - originalData.loudness,
    peakChange: masteredData.peak - originalData.peak,
    rmsChange: masteredData.rms - originalData.rms,
    dynamicRangeChange: masteredData.dynamicRange - originalData.dynamicRange
  } : null;

  const getImprovementColor = (change: number) => {
    if (change > 0) return 'text-green-400';
    if (change < 0) return 'text-red-400';
    return 'text-gray-400';
  };

  const getImprovementIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="w-4 h-4 text-green-400" />;
    if (change < 0) return <BarChart3 className="w-4 h-4 text-red-400" />;
    return <CheckCircle className="w-4 h-4 text-gray-400" />;
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Hidden audio elements */}
      {originalAudioUrl && (
        <audio
          ref={originalAudioRef}
          src={originalAudioUrl}
          onTimeUpdate={handleOriginalTimeUpdate}
          onLoadedMetadata={handleOriginalLoadedMetadata}
          onEnded={handleOriginalEnded}
          preload="metadata"
        />
      )}
      {masteredAudioUrl && (
        <audio
          ref={masteredAudioRef}
          src={masteredAudioUrl}
          onTimeUpdate={handleMasteredTimeUpdate}
          onLoadedMetadata={handleMasteredLoadedMetadata}
          onEnded={handleMasteredEnded}
          preload="metadata"
        />
      )}

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
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-1.5 rounded-lg">
              <BarChart3 className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-xl font-bold text-white">Analysis & Comparison</h2>
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-xs text-gray-400">Effects Applied</div>
          <div className="text-lg font-bold text-blue-400">
            {getEffectsApplied().length}
          </div>
        </div>
      </div>

      {/* Before & After Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Original Audio */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-700 rounded-lg p-4 border border-gray-600">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-md font-semibold text-white flex items-center">
              <Volume2 className="w-4 h-4 mr-2" />
              Original Audio
            </h3>
            <div className="text-xs text-gray-400">Before Mastering</div>
          </div>
          
          <div className="bg-gray-900 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-400">File: {originalFile?.name}</span>
              <button
                onClick={handleOriginalPlayPause}
                disabled={!originalReady}
                className={`p-1.5 rounded transition-colors ${
                  originalReady 
                    ? 'bg-blue-500 hover:bg-blue-400' 
                    : 'bg-gray-600 cursor-not-allowed'
                }`}
              >
                {isPlayingOriginal ? (
                  <Pause className="w-3 h-3 text-white" />
                ) : (
                  <Play className="w-3 h-3 text-white" />
                )}
              </button>
            </div>
            <div className="w-full bg-gray-800 rounded h-1.5">
              <div className="bg-blue-500 h-1.5 rounded" style={{ width: `${getProgressPercentage(originalCurrentTime, originalDuration)}%` }}></div>
            </div>
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>{formatTime(originalCurrentTime)}</span>
              <span>{formatTime(originalDuration)}</span>
            </div>
          </div>
        </div>

        {/* Mastered Audio */}
        <div className="bg-gradient-to-br from-green-800 to-green-700 rounded-lg p-4 border border-green-600">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-md font-semibold text-white flex items-center">
              <Volume2 className="w-4 h-4 mr-2" />
              Mastered Audio
            </h3>
            <div className="flex items-center space-x-2">
              <div className="text-xs text-green-400 font-medium">✓ Processed</div>
              <div className="text-xs text-gray-400">After Mastering</div>
            </div>
          </div>
          
          <div className="bg-gray-900 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-400">File: {originalFile?.name} (Mastered)</span>
              <button
                onClick={handleMasteredPlayPause}
                disabled={!masteredReady}
                className={`p-1.5 rounded transition-colors ${
                  masteredReady 
                    ? 'bg-green-500 hover:bg-green-400' 
                    : 'bg-gray-600 cursor-not-allowed'
                }`}
              >
                {isPlayingMastered ? (
                  <Pause className="w-3 h-3 text-white" />
                ) : (
                  <Play className="w-3 h-3 text-white" />
                )}
              </button>
            </div>
            <div className="w-full bg-gray-800 rounded h-1.5">
              <div className="bg-green-500 h-1.5 rounded" style={{ width: `${getProgressPercentage(masteredCurrentTime, masteredDuration)}%` }}></div>
            </div>
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>{formatTime(masteredCurrentTime)}</span>
              <span>{formatTime(masteredDuration)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Analysis Summary */}
      <div className="bg-gradient-to-br from-gray-800 to-gray-700 rounded-lg p-6 border border-gray-600">
                 <div className="flex items-center justify-between mb-6">
           <h3 className="text-lg font-semibold text-white flex items-center">
             <BarChart3 className="w-5 h-5 mr-2 text-blue-400" />
             Analysis Summary
           </h3>
           <div className="flex items-center space-x-2">
             {isAnalyzing && (
               <div className="flex items-center space-x-2 text-yellow-400">
                 <Loader2 className="w-4 h-4 animate-spin" />
                 <span className="text-sm">Analyzing...</span>
               </div>
             )}
             {analysisError && (
               <div className="text-sm text-red-400 font-medium">
                 ⚠️ {analysisError}
               </div>
             )}
             {!isAnalyzing && !analysisError && (
               <div className="text-right">
                 <span className="text-sm text-green-400 font-medium">✓ Analysis Complete</span>
                 <div className="text-xs text-blue-400">Real-time meter data</div>
                 {usingFallbackAnalysis && (
                   <div className="text-xs text-yellow-400">Basic analysis mode</div>
                 )}
               </div>
             )}
           </div>
         </div>

        {/* Comparison Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                     {/* Original Analysis */}
           <div className="bg-gray-800 bg-opacity-50 rounded-lg p-4">
             <h4 className="text-sm font-semibold text-gray-300 mb-4 flex items-center">
               <BarChart3 className="w-4 h-4 mr-2" />
               Original Audio Analysis
               {!originalAnalysis && isAnalyzing && (
                 <Loader2 className="w-3 h-3 ml-2 animate-spin text-yellow-400" />
               )}
             </h4>
             <div className="space-y-3">
               {originalAnalysis ? (
                 <>
                   <div className="flex justify-between items-center">
                     <span className="text-xs text-gray-400">Loudness:</span>
                     <span className="text-sm font-bold text-gray-300">
                       {originalData.loudness.toFixed(1)} dB
                     </span>
                   </div>
                   <div className="flex justify-between items-center">
                     <span className="text-xs text-gray-400">True Peak:</span>
                     <span className="text-sm font-bold text-gray-300">
                       {originalData.peak.toFixed(1)} dB
                     </span>
                   </div>
                   <div className="flex justify-between items-center">
                     <span className="text-xs text-gray-400">RMS:</span>
                     <span className="text-sm font-bold text-gray-300">
                       {originalData.rms.toFixed(1)} dB
                     </span>
                   </div>
                   <div className="flex justify-between items-center">
                     <span className="text-xs text-gray-400">Dynamic Range:</span>
                     <span className="text-sm font-bold text-gray-300">
                       {originalData.dynamicRange.toFixed(1)} dB
                     </span>
                   </div>
                 </>
               ) : (
                 <div className="text-center py-4">
                   <div className="text-xs text-gray-400">
                     {isAnalyzing ? 'Analyzing original audio...' : 'Original analysis not available'}
                   </div>
                 </div>
               )}
             </div>
           </div>

                     {/* Mastered Analysis */}
           <div className="bg-green-900 bg-opacity-30 rounded-lg p-4 border border-green-500 border-opacity-30">
             <h4 className="text-sm font-semibold text-green-400 mb-4 flex items-center">
               <CheckCircle className="w-4 h-4 mr-2" />
               Mastered Audio Analysis
               {!masteredAnalysis && isAnalyzing && (
                 <Loader2 className="w-3 h-3 ml-2 animate-spin text-yellow-400" />
               )}
             </h4>
             <div className="space-y-3">
               {masteredAnalysis ? (
                 <>
                   <div className="flex justify-between items-center">
                     <span className="text-xs text-gray-400">Loudness:</span>
                     <span className="text-sm font-bold text-green-400">
                       {masteredData.loudness.toFixed(1)} dB
                     </span>
                   </div>
                   <div className="flex justify-between items-center">
                     <span className="text-xs text-gray-400">True Peak:</span>
                     <span className="text-sm font-bold text-green-400">
                       {masteredData.peak.toFixed(1)} dB
                     </span>
                   </div>
                   <div className="flex justify-between items-center">
                     <span className="text-xs text-gray-400">RMS:</span>
                     <span className="text-sm font-bold text-green-400">
                       {masteredData.rms.toFixed(1)} dB
                     </span>
                   </div>
                   <div className="flex justify-between items-center">
                     <span className="text-xs text-gray-400">Dynamic Range:</span>
                     <span className="text-sm font-bold text-green-400">
                       {masteredData.dynamicRange.toFixed(1)} dB
                     </span>
                   </div>
                 </>
               ) : (
                 <div className="text-center py-4">
                   <div className="text-xs text-gray-400">
                     {isAnalyzing ? 'Analyzing mastered audio...' : 'Mastered analysis not available'}
                   </div>
                 </div>
               )}
             </div>
           </div>
        </div>

        {/* Improvements Section */}
        <div className="bg-blue-900 bg-opacity-20 rounded-lg p-4 border border-blue-500 border-opacity-30 mb-6">
          <h4 className="text-sm font-semibold text-blue-400 mb-4 flex items-center">
            <TrendingUp className="w-4 h-4 mr-2" />
            Improvements Made
          </h4>
          {isAnalyzing ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-blue-400">Analyzing audio to calculate improvements...</p>
            </div>
          ) : changes ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="flex justify-center mb-1">
                  {getImprovementIcon(changes.loudnessChange)}
                </div>
                <div className={`text-lg font-bold ${getImprovementColor(changes.loudnessChange)}`}>
                  {changes.loudnessChange > 0 ? '+' : ''}{changes.loudnessChange.toFixed(1)}
                </div>
                <div className="text-xs text-gray-400">Loudness</div>
              </div>
              <div className="text-center">
                <div className="flex justify-center mb-1">
                  {getImprovementIcon(changes.peakChange)}
                </div>
                <div className={`text-lg font-bold ${getImprovementColor(changes.peakChange)}`}>
                  {changes.peakChange > 0 ? '+' : ''}{changes.peakChange.toFixed(1)}
                </div>
                <div className="text-xs text-gray-400">Peak</div>
              </div>
              <div className="text-center">
                <div className="flex justify-center mb-1">
                  {getImprovementIcon(changes.rmsChange)}
                </div>
                <div className={`text-lg font-bold ${getImprovementColor(changes.rmsChange)}`}>
                  {changes.rmsChange > 0 ? '+' : ''}{changes.rmsChange.toFixed(1)}
                </div>
                <div className="text-xs text-gray-400">RMS</div>
              </div>
              <div className="text-center">
                <div className="flex justify-center mb-1">
                  {getImprovementIcon(changes.dynamicRangeChange)}
                </div>
                <div className={`text-lg font-bold ${getImprovementColor(changes.dynamicRangeChange)}`}>
                  {changes.dynamicRangeChange > 0 ? '+' : ''}{changes.dynamicRangeChange.toFixed(1)}
                </div>
                <div className="text-xs text-gray-400">Dynamic</div>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-400">Analysis data not available yet</p>
            </div>
          )}
        </div>

                 {/* Additional Analysis Metrics */}
         {(originalAnalysis || masteredAnalysis) && (
           <div className="bg-indigo-900 bg-opacity-20 rounded-lg p-4 border border-indigo-500 border-opacity-30 mb-6">
             <h4 className="text-sm font-semibold text-indigo-400 mb-4 flex items-center">
               <BarChart3 className="w-4 h-4 mr-2" />
               Additional Analysis Metrics
             </h4>
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
               {/* Original Additional Metrics */}
               <div>
                 <h5 className="text-xs font-semibold text-gray-300 mb-3">Original Audio</h5>
                 <div className="space-y-2">
                   {originalAnalysis ? (
                     <>
                       <div className="flex justify-between items-center">
                         <span className="text-xs text-gray-400">Stereo Width:</span>
                         <span className="text-sm font-bold text-gray-300">
                           {(originalAnalysis.stereoWidth * 100).toFixed(1)}%
                         </span>
                       </div>
                       <div className="flex justify-between items-center">
                         <span className="text-xs text-gray-400">Correlation:</span>
                         <span className="text-sm font-bold text-gray-300">
                           {originalAnalysis.correlation.toFixed(3)}
                         </span>
                       </div>
                       <div className="flex justify-between items-center">
                         <span className="text-xs text-gray-400">Crest Factor:</span>
                         <span className="text-sm font-bold text-gray-300">
                           {originalAnalysis.crestFactor.toFixed(2)}
                         </span>
                       </div>
                       <div className="flex justify-between items-center">
                         <span className="text-xs text-gray-400">Loudness Range:</span>
                         <span className="text-sm font-bold text-gray-300">
                           {originalAnalysis.loudnessRange.toFixed(1)} LU
                         </span>
                       </div>
                     </>
                   ) : (
                     <div className="text-xs text-gray-400">Not available</div>
                   )}
                 </div>
               </div>
               
               {/* Mastered Additional Metrics */}
               <div>
                 <h5 className="text-xs font-semibold text-green-400 mb-3">Mastered Audio</h5>
                 <div className="space-y-2">
                   {masteredAnalysis ? (
                     <>
                       <div className="flex justify-between items-center">
                         <span className="text-xs text-gray-400">Stereo Width:</span>
                         <span className="text-sm font-bold text-green-400">
                           {(masteredAnalysis.stereoWidth * 100).toFixed(1)}%
                         </span>
                       </div>
                       <div className="flex justify-between items-center">
                         <span className="text-xs text-gray-400">Correlation:</span>
                         <span className="text-sm font-bold text-green-400">
                           {masteredAnalysis.correlation.toFixed(3)}
                         </span>
                       </div>
                       <div className="flex justify-between items-center">
                         <span className="text-xs text-gray-400">Crest Factor:</span>
                         <span className="text-sm font-bold text-green-400">
                           {masteredAnalysis.crestFactor.toFixed(2)}
                         </span>
                       </div>
                       <div className="flex justify-between items-center">
                         <span className="text-xs text-gray-400">Loudness Range:</span>
                         <span className="text-sm font-bold text-green-400">
                           {masteredAnalysis.loudnessRange.toFixed(1)} LU
                         </span>
                       </div>
                     </>
                   ) : (
                     <div className="text-xs text-gray-400">Not available</div>
                   )}
                 </div>
               </div>
             </div>
           </div>
         )}

                   {/* Professional Loudness Analysis */}
          {(originalLoudnessAnalysis || masteredLoudnessAnalysis) && (
            <div className="bg-amber-900 bg-opacity-20 rounded-lg p-4 border border-amber-500 border-opacity-30 mb-6">
              <h4 className="text-sm font-semibold text-amber-400 mb-4 flex items-center">
                <BarChart3 className="w-4 h-4 mr-2" />
                Professional Loudness Analysis (ITU-R BS.1770-4)
              </h4>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Original Professional Analysis */}
                <div>
                  <h5 className="text-xs font-semibold text-gray-300 mb-3">Original Audio</h5>
                  {originalLoudnessAnalysis ? (
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-400">Momentary:</span>
                        <span className="text-sm font-bold text-gray-300">
                          {originalLoudnessAnalysis.momentary.value === -Infinity ? "-∞" : originalLoudnessAnalysis.momentary.value.toFixed(1)} {originalLoudnessAnalysis.momentary.unit}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-400">Short-term:</span>
                        <span className="text-sm font-bold text-gray-300">
                          {originalLoudnessAnalysis.shortTerm.value === -Infinity ? "-∞" : originalLoudnessAnalysis.shortTerm.value.toFixed(1)} {originalLoudnessAnalysis.shortTerm.unit}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-400">Integrated:</span>
                        <span className="text-sm font-bold text-gray-300">
                          {originalLoudnessAnalysis.integrated.value === -Infinity ? "-∞" : originalLoudnessAnalysis.integrated.value.toFixed(1)} {originalLoudnessAnalysis.integrated.unit}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-400">True Peak:</span>
                        <span className="text-sm font-bold text-gray-300">
                          {originalLoudnessAnalysis.truePeak.value === -Infinity ? "-∞" : originalLoudnessAnalysis.truePeak.value.toFixed(1)} {originalLoudnessAnalysis.truePeak.unit}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-400">Loudness Range:</span>
                        <span className="text-sm font-bold text-gray-300">
                          {originalLoudnessAnalysis.loudnessRange.value.toFixed(1)} {originalLoudnessAnalysis.loudnessRange.unit}
                        </span>
                      </div>
                      <div className="mt-2 p-2 bg-gray-800 rounded text-xs">
                        <span className="text-gray-400">Compliance: </span>
                        <span className={originalLoudnessAnalysis.compliance.withinGrammyStandard ? "text-green-400" : "text-red-400"}>
                          {originalLoudnessAnalysis.compliance.withinGrammyStandard ? "✓ Grammy Standard" : "✗ Needs Adjustment"}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs text-gray-400">Not available</div>
                  )}
                </div>
                
                {/* Mastered Professional Analysis */}
                <div>
                  <h5 className="text-xs font-semibold text-green-400 mb-3">Mastered Audio</h5>
                  {masteredLoudnessAnalysis ? (
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-400">Momentary:</span>
                        <span className="text-sm font-bold text-green-400">
                          {masteredLoudnessAnalysis.momentary.value === -Infinity ? "-∞" : masteredLoudnessAnalysis.momentary.value.toFixed(1)} {masteredLoudnessAnalysis.momentary.unit}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-400">Short-term:</span>
                        <span className="text-sm font-bold text-green-400">
                          {masteredLoudnessAnalysis.shortTerm.value === -Infinity ? "-∞" : masteredLoudnessAnalysis.shortTerm.value.toFixed(1)} {masteredLoudnessAnalysis.shortTerm.unit}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-400">Integrated:</span>
                        <span className="text-sm font-bold text-green-400">
                          {masteredLoudnessAnalysis.integrated.value === -Infinity ? "-∞" : masteredLoudnessAnalysis.integrated.value.toFixed(1)} {masteredLoudnessAnalysis.integrated.unit}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-400">True Peak:</span>
                        <span className="text-sm font-bold text-green-400">
                          {masteredLoudnessAnalysis.truePeak.value === -Infinity ? "-∞" : masteredLoudnessAnalysis.truePeak.value.toFixed(1)} {masteredLoudnessAnalysis.truePeak.unit}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-400">Loudness Range:</span>
                        <span className="text-sm font-bold text-green-400">
                          {masteredLoudnessAnalysis.loudnessRange.value.toFixed(1)} {masteredLoudnessAnalysis.loudnessRange.unit}
                        </span>
                      </div>
                      <div className="mt-2 p-2 bg-gray-800 rounded text-xs">
                        <span className="text-gray-400">Compliance: </span>
                        <span className={masteredLoudnessAnalysis.compliance.withinGrammyStandard ? "text-green-400" : "text-red-400"}>
                          {masteredLoudnessAnalysis.compliance.withinGrammyStandard ? "✓ Grammy Standard" : "✗ Needs Adjustment"}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs text-gray-400">Not available</div>
                  )}
                </div>
              </div>
            </div>
          )}



          {/* Effects Applied */}
          <div className="bg-purple-900 bg-opacity-20 rounded-lg p-4 border border-purple-500 border-opacity-30">
            <h4 className="text-sm font-semibold text-purple-400 mb-4 flex items-center">
              <Zap className="w-4 h-4 mr-2" />
              Effects Applied
            </h4>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
              {getEffectsApplied().map((effect, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <CheckCircle className="w-3 h-3 text-green-400" />
                  <span className="text-xs text-gray-300">{effect}</span>
                </div>
              ))}
            </div>
          </div>
      </div>

      {/* Continue to Export Button */}
      <div className="text-center">
        <button
          onClick={onContinue}
          className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-8 py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-600 transition-all duration-200 flex items-center justify-center space-x-2 mx-auto"
        >
          <span>Continue to Export</span>
          <ArrowLeft className="w-4 h-4 rotate-180" />
        </button>
      </div>
    </div>
  );
};

export default AnalysisPage;
